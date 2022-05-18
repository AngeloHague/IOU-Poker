import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Image } from 'react-native'
//import firebase from 'firebase/app'
//import 'firebase/auth'
import { auth } from '../firebase'
import { ScrollView } from 'react-native-gesture-handler'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import common from '../styles/common'
import { renderPlayers, playerAction, renderPlayerHand } from '../components/GameHelper'
import { initListeners } from '../components/Listeners'
import { styles } from '../styles/lobby'
import { LobbyInfo } from '../components/LobbyInfo'
import { normaliseHeight } from '../styles/normalize'
import PlayerHand from '../components/PlayerHand'
import PlayerCards from '../components/PlayerCards'
import GameOptions from '../components/GameOptions'
import Table from '../components/Table'

export default class GameLobbyScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }

    constructor(props) {
        super(props)
        this.ready = false;

        this.state = {
            room_id: global.room.id,
            players: new Map(),
            player_html: (<View></View>),
            ready: false,
            game_started: false,
            show_options: false,
            errorMessage: null,
            // game info:
            chips: 0,
            pot: 0,
            player_hand: [],
            community_cards: [],
            player_hand_html: (<View></View>),
            community_cards_html: (<View></View>),
        }
    }

    changeReadyState = () => {
        this.ready = !this.ready
        global.room.send("changeReadyState", {isReady: this.ready})
    }

    showOptions = () => {
        let options = this.state.show_options
        this.setState({show_options: !options})
    }

    playerCheck = () => {
        console.log(auth.currentUser.uid, ' is checking ')
        //global.room.send("playerTurn", {action: 'check'})
        playerAction(global.room, 'check', 0)
    }

    playerBet = (amount) => {
        console.log(auth.currentUser.uid, ' is raising ', amount)
        //global.room.send("playerTurn", {action: 'bet', amount: amount})
        playerAction(global.room, 'raise', amount)
    }

    playerFold = () => {
        console.log(auth.currentUser.uid, ' is folding ')
        //global.room.send("playerTurn", {action: 'fold'})
        playerAction(global.room, 'fold', 0)
    }

    componentDidMount() {
        global.room.send("message", {contents: "mounted"}) // DEBUG PURPOSES
        //loadLobbyInfo(this, global.room);
        //this.updatePlayers(global.room.state.players) // render players in current state
        if (global.room.state.game_started == true) this.setState({game_started: true})

        initListeners(this);
        //renderPlayerHand(global.room.state);

        room.onMessage("error", (e) => {
            this.setState({errorMessage: e})
        })

        room.onMessage("startGame", (counter) => {
            console.log('Starting game')
            this.setState({game_started: true})
        })

        room.onMessage("whoseTurn", (player) => {
            console.log('Player turn: ', player)
        })
    }

    componentWillUnmount() {
        global.room.leave()
    }

    render() {
        return (
            <View style={common.container}>
                <View style={common.navBar}>
                    <TouchableOpacity style={common.navButton} onPress={() => this.props.navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}>Go Back</Text></TouchableOpacity>
                    <Image style={common.navLogo} source={require('../assets/Logo.png')} />
                    <TouchableOpacity style={common.navButton}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}>Chat</Text></TouchableOpacity>
                </View>
                <View>
                <ScrollView horizontal={true} style={styles.playerScroller}>
                    {<View style={{margin: 0}}>
                        <PlayerCards players={this.state.players} />
                    </View>}
                </ScrollView>
                </View>


                <View style={styles.gameContainer}>
                    <View style={styles.board}>
                        {this.state.error &&
                        <View style={common.errorMessage}>
                            {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                        </View>}
                        {!this.state.game_started && LobbyInfo(this)}
                        {this.state.game_started &&
                        <View style={{ flex: 1, flexDirection: 'column'}}>
                            <Table cards={this.state.community_cards} pot={this.state.pot}/>
                            <PlayerHand cards={this.state.player_hand}/>
                        </View>}
                    </View>
                </View>
                <GameOptions chips={this.state.chips} game_started={this.state.game_started} show_options={this.state.show_options} showOptions={this.showOptions} changeReadyState={this.changeReadyState} />
            </View>
        )
    }
}
