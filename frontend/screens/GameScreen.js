import React, { Component } from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
//import { Card, Deck } from '../components/deck'
import { newDeck, shuffle, drawCard } from '../components/cards'
//import { Player } from '../components/player'
import firebase from 'firebase'
import { TabRouter } from 'react-navigation'

const io = require('socket.io-client');

// Replace this URL with your own, if you want to run the backend locally!
const SocketEndpoint = 'https://09d082fe8802.ngrok.io';
const socket = io(SocketEndpoint, {
    transports: ['websocket'],
  });

export default class Game extends Component {
    constructor( props) {
        super(props)
        this.state = {
            stage: 'setting_up',//Stage of the game
            players: [],        //Array of players
            buy_in: [],         //Buy-in info
            startingStack: 0,   //Starting no. of chips per player
            round: 0,           //Round number
            total_bet: 0,       //Total stack of player bets 
            dealer: '',         //Dealer's player id
            starting_player: '',//Starting player's turn
            current_player: 0,  //Current player's turn (position in players[] array)
            playersRemaining: 0,//No. of player's who are still in the game
            playersMatching: 0, //No. of player's matching the current bet
            playersFolded: 0,   //No. of players who have folders
            communityCards: [], //Community Cards
            hand: [],           //Player hand
            //socket.io
            isConnected: false,
            ping: null
        }

        const { game_id } = props.navigation.state.params
        this.state.game_id = game_id
        const dbRef = firebase.firestore().collection('games').doc(game_id).get().then(doc => {
            socket.emit('log', game_id)
            socket.emit('log', doc)
            if (!doc.exists) {
                socket.emit('log', 'No such document')
                //this.props.navigation.goBack()
            } else {
                socket.emit('log', 'Document exists!!')
            }
        })
        
    }

    performStage() {
        switch (this.stage) {
            case 0:
                //New Game: Inititate Setup
                break;
            case 1:
                //Deal Cards
                break;
            case 2:
                //Place Bets
                break;
            case 3:
                //Reveal The Flop
                break;
            case 4:
                //Reveal The Turn
                break;
            case 5:
                //Reveal The River
                break;
            case 6:
                //Display Winner
                break;
        }
    }

    componentDidMount() {
        //debug purposes
        socket.on('connect', () => {
            this.setState({ isConnected: true })
        })

        socket.on('ping', (ping) => {
            this.setState(ping)
        })

        // //Firebase listener:
        // const doc = firebase.firestore().collection('games').doc(this.state.game_id)
        // const gameData = doc.onSnapshot(docSnapshot => {
        //     socket.emit('log', this.state.game_id)
        //     socket.emit('log', docSnapshot.get('players'))
        //     // ...
        //   }, err => {
        //     socket.emit('log', err)
        //   })
        
    }

    dealCards() {
        var sortedDeck = newDeck()
        var deck = shuffle(sortedDeck)
        var i = 0;
        for (i; i < 2; i++) {
            let {remainingDeck, card} = drawCard(deck)
            deck = remainingDeck
            socket.emit('log', card)
        }
        socket.emit('log', deck.length)
    }

    render() {
        return (
            <View style = {styles.container} >
                <View style={styles.game}>
                <Text>connected: {this.state.isConnected ? 'true' : 'false'}</Text>
                {this.state.data && <Text>ping response: {this.state.data}</Text>}
                {this.state.hand && <Text>Hand: {this.state.hand} </Text>}
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.dealCards}
                >
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Deal Cards</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    game: {
        marginTop: 48,
        marginBottom: 48,
        marginHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        marginHorizontal: 30,
        marginVertical: 10,
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
