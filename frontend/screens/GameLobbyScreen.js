import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import { ScrollView } from 'react-native-gesture-handler'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import common from '../styles/common'

export default class GameLobbyScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }

    constructor(props) {
        super(props)
        this.ready = false;

        this.state = {
            room_id: global.room.id,
            player_html: (<View></View>),
            game_started: false,
            show_options: false,
            errorMessage: null
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

    playerAction = (action, amount) => {
        global.room.send("playerTurn", {action: action, amount: amount})
    }

    playerCheck = () => {
        global.room.send("playerTurn", {action: 'check'})
    }

    playerBet = (amount) => {
        global.room.send("playerTurn", {action: 'bet', amount: 100})
    }

    playerFold = () => {
        global.room.send("playerTurn", {action: 'fold'})
    }

    renderPlayers = (players) => {
        this.state.players = players
        let started = this.state.game_started
        return (
            <View style={styles.playerContainer}>
            {players.map(function(player, idx){
                return (<View key={player.uid} style={[styles.playerCard, (!room.state.game_started && player.ready) ? {borderColor: '#b4f56c'}:{borderColor: '#E9446A'}]}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <View style={styles.cardContainer}>
                        <View>
                            <Image style={styles.card1} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
                        </View>
                        <View>
                            <Image style={styles.card2} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
                        </View>
                    </View>
                    <View>
                        {!started && <Text style={styles.playerStatus}>{player.ready ? 'Ready':'Not Ready'}</Text>}
                        {started && <Text style={styles.playerStatus}>{player.chips}</Text>}
                        
                    </View>
                </View>)
             })}
            </View>
          )
    }

    updatePlayers(players) {
        let _players = []
          players.forEach((player, key) => {
            //console.log(`${key}'s name: ${player['name']}`)
            //console.log(`${key}'s uid: ${player['uid']}`)
            //console.log(`${key}'s ready state: ${player['ready']}`)
            let _player = {
                name: player['name'],
                uid: player['uid'],
                ready: player['ready'],
                chips: player['chips'],
                folded: player['folded'],
            }
            _players.push(_player)
        })
        this.setState({player_html: this.renderPlayers(_players)})
    }

    componentDidMount() {
        global.room.send("message", {contents: "test"})
        //this.updatePlayers(global.room.state.players) // render players in current state

        room.state.players.onAdd = (player, key) => {
            console.log(player, " has been added at ", key)
            global.room.state.players.set(key, player)
            this.updatePlayers(global.room.state.players) // render players in current state
        
            // add your player entity to the game world!
        
            // If you want to track changes on a child object inside a map, this is a common pattern:
            player.onChange = (changes) => {
                changes.forEach(change => {
                    if (change.field == 'ready') {
                        //console.log(key, '\'s ready state has changed: ', change.value)
                        let player = global.room.state.players.get(key)
                        player.ready = change.value
                        global.room.state.players.set(key, player)
                        this.updatePlayers(global.room.state.players) // render players in current state
                    }
                    if (change.field == 'cards') {
                        console.log(key, '\'s ready state has changed: ', change.value)
                    }
                });
            };
        
            // force "onChange" to be called immediatelly
            player.triggerAll();
        };

        room.state.players.onRemove = (player, key) => {
            console.log(player, "has been removed at", key);
            global.room.state.players.delete(key)
            this.updatePlayers(global.room.state.players) // render players in current state
        
            // remove your player entity from the game world!
        };

        room.state.players.onChange = (changes) => {
            console.log(changes)
        }

        room.onMessage("error", (e) => {
            this.setState({errorMessage: e})
        })

        room.onMessage("startGame", (counter) => {
            console.log('Starting game')
            this.setState({game_started: true})
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
                    {this.state.players && <View style={{margin: 0}}>
                        {this.state.player_html}
                    </View>}
                </ScrollView>
                </View>
                <View style={styles.gameContainer}>
                    <View style={styles.board}>
                        <View style={styles.roomCodeContainer}>
                            {!this.state.game_started && 
                            <Text style={styles.greeting}>{'Join code:'}</Text>}
                            {!this.state.game_started && 
                            <Text style={styles.gameCode}>{this.state.room_id}</Text>}
                        </View>
                        <View style={common.errorMessage}>
                            {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                        </View>
                    </View>
                    
                    
                    <View style={{ flex: 1 }} />
                </View>
                <View style={[styles.footer, (this.state.show_options) ? {bottom: 0}:{bottom: -150}]}>
                    {!this.state.game_started &&
                    <TouchableOpacity style={styles.readyButton} onPress={this.changeReadyState}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Vote to Start</Text>
                    </TouchableOpacity>}
                    <View style={styles.menuOptions}>
                        {this.state.game_started &&
                        <TouchableOpacity style={styles.readyButton} onPress={this.showOptions}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }} onPress={this.showOptions}>Options</Text>
                        </TouchableOpacity>}
                        {this.state.game_started &&
                        <TouchableOpacity style={styles.optionsButton}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }} onPress={this.playerCheck}>Check</Text>
                        </TouchableOpacity>}
                        {this.state.game_started &&
                        <TouchableOpacity style={styles.optionsButton}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }} onPress={this.playerBet}>Bet</Text>
                        </TouchableOpacity>}
                        {this.state.game_started &&
                        <TouchableOpacity style={styles.optionsButton}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }} onPress={this.playerFold}>Fold</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    playerScroller: {
        borderBottomColor: '#8A8F9E', borderBottomWidth: StyleSheet.hairlineWidth,
    },
    playerContainer: {
        flex: 0,
        flexDirection: 'row',
        marginHorizontal: 80,
        marginVertical: 15,
    },
    playerCard: {
        borderColor: '#E9446A',
        borderWidth: 10,
        height: 200,
        width: 200,
        fontSize: 15,
        marginHorizontal: 25,
        flex:0, justifyContent: 'space-between',
    },
    playerName: {
        //color: 'white',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 15,
        paddingTop: 10
    },
    playerStatus: {
        //color: 'white',
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 15,
        paddingBottom: 10
    },
    playerReady: {
        backgroundColor: 'red',
        borderColor: '#8A8F9E',
        borderRadius: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        //color: '#161F3D'
    },
    gameContainer: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: 'grey',
        position: 'absolute',
        height: 200,
        width: 415,
        bottom: 50
    },
    menuOptions: {
        flex:1, justifyContent: 'space-around',
    },
    optionsButton: {
        flex: 0,
        marginHorizontal: 30,
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        //paddingHorizontal: 10,
        //marginBottom: 20,
        //position: 'absolute',
        //left: 0, 
        //bottom: 52,
    },
    readyButton: {
        marginHorizontal: 30,
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        //position: 'absolute',
        //left: 0, 
        //bottom: 52,
    },
    gameCode: {
        fontSize: 75,
        fontWeight: '400',
        textAlign: 'center'
    },
    greeting: {
        //marginTop: 32,
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center'
    },
    board: {

    },
    cardContainer: {
        alignItems: 'center', //Centered vertically
        flex:1, flexDirection: 'row', justifyContent: 'space-around',
        marginHorizontal: 8
    },
    card1: {
        width: 58,
        height: 80,
        marginRight: -50,
        transform: [{ rotate: '-16deg' }],
    },
    card2: {
        width: 58,
        height: 80,
        marginLeft: -50,
        transform: [{ rotate: '16deg' }],
    },
})
