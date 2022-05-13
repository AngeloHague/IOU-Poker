import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Image } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import { ScrollView } from 'react-native-gesture-handler'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import common from '../styles/common'
import { renderPlayers, playerAction, renderPlayerHand } from '../components/GameHelper'
import { initListeners } from '../components/Listeners'
import { styles } from '../styles/lobby'

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
            errorMessage: null,
            // game info:
            pot: 0,
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
        console.log(firebase.auth().currentUser.uid, ' is checking ')
        //global.room.send("playerTurn", {action: 'check'})
        playerAction(global.room, 'check', 0)
    }

    playerBet = (amount) => {
        console.log(firebase.auth().currentUser.uid, ' is raising ', amount)
        //global.room.send("playerTurn", {action: 'bet', amount: amount})
        playerAction(global.room, 'raise', amount)
    }

    playerFold = () => {
        console.log(firebase.auth().currentUser.uid, ' is folding ')
        //global.room.send("playerTurn", {action: 'fold'})
        playerAction(global.room, 'fold', 0)
    }

    componentDidMount() {
        global.room.send("message", {contents: "mounted"}) // DEBUG PURPOSES
        //loadLobbyInfo(this, global.room);
        //this.updatePlayers(global.room.state.players) // render players in current state

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
                    {this.state.players && <View style={{margin: 0}}>
                        {this.state.player_html}
                    </View>}
                </ScrollView>
                </View>


                <View style={styles.gameContainer}>
                    <View style={styles.board}>
                        {/* RENDER ERROR */}
                        {this.state.error &&
                        <View style={common.errorMessage}>
                            {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                        </View>}
                        {/* RENDER GAME LOBBY JOIN CODE */}
                        {!this.state.game_started && 
                        <View style={styles.roomCodeContainer}>
                            <Text style={styles.greeting}>Join code:</Text>
                            <Text style={styles.gameCode}>{this.state.room_id}</Text>
                        </View>}
                        {/* RENDER GAME LOBBY INFO */}
                        {!this.state.game_started && 
                        <View style={styles.gameInfoParentContainer}>
                            <Text style={styles.greeting}>Game Rules:</Text>
                            <View style={styles.gameInfoContainer}>
                                <View style={styles.gameInfoLabels}>
                                    <Text style={styles.gameInfo}>Stake:</Text>
                                    <Text style={styles.gameInfo}>Amount:</Text>
                                    <Text style={styles.gameInfo}>Starting Stack:</Text>
                                    <Text style={styles.gameInfo}>Big Blind:</Text>
                                    <Text style={styles.gameInfo}>Small Blind:</Text>
                                </View>
                                <View style={styles.gameInfo}>
                                    <Text style={styles.gameInfo}>{global.room.state.stake}</Text>
                                    <Text style={styles.gameInfo}>{global.room.state.amount}</Text>
                                    <Text style={styles.gameInfo}>{global.room.state.chips}</Text>
                                    <Text style={styles.gameInfo}>{global.room.state.b_blind}</Text>
                                    <Text style={styles.gameInfo}>{global.room.state.s_blind}</Text>
                                </View>
                            </View>
                        </View>}
                        {/* RENDER GAME */}
                        {this.state.game_started &&
                        <View style={styles.roomCodeContainer}>
                            <Text style={styles.greeting}>{'Community Cards:'}</Text>
                            {this.state.community_cards_html}
                            <Text style={styles.greeting}>{this.state.pot}</Text>
                        </View>}
                        {this.state.game_started &&
                        <View style={styles.roomCodeContainer}>
                            <Text style={styles.greeting}>{'Your Cards:'}</Text>
                            <View style={styles.yourCardContainer}>
                                {this.state.player_hand_html}
                            </View>
                        </View>}
                    <View style={{ flex: 1 }} />
                    </View>
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
                        <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerCheck()}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>Check</Text>
                        </TouchableOpacity>}
                        {this.state.game_started &&
                        <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerBet(100)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>Bet</Text>
                        </TouchableOpacity>}
                        {this.state.game_started &&
                        <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerFold()}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>Fold</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </View>
        )
    }
}
