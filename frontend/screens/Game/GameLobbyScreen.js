import React, { Component } from 'react'
import { Text, TouchableOpacity, View, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import common from '../../styles/common'
import { initListeners } from '../../components/Listeners'
import { styles } from '../../styles/lobby'
import { LobbyInfo } from '../../components/LobbyInfo'
import PlayerHand from '../../components/PlayerHand'
import PlayerCards from '../../components/PlayerCards'
import GameOptions from '../../components/GameOptions'
import Table from '../../components/Table'
import Background from '../../assets/background.svg'
import FlashDisplayer from '../../components/FlashDisplayer'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normaliseFont } from '../../styles/normalize'
import Chat from '../../components/Chat'

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
            show_chat: false,
            errorMessage: null,
            // game info:
            chips: 0,
            pot: 0,
            player_hand: [],
            community_cards: [],
            dealer: null,
            big_blind: null,
            small_blind: null,
            current_player: null,
            current_bet: 0,
            largest_bet: 0,
            chat_messages: [],
            notifications: [],
        }
    }

    changeReadyState = () => {
        this.ready = !this.ready
        global.room.send("changeReadyState", {isReady: this.ready})
        // this.setState({ notifications: [...this.state.notifications, ('Player is now: ' + this.ready)] }) // debug purposes
    }

    showOptions = () => {
        let options = this.state.show_options
        this.setState({show_options: !options})
    }

    // setHelpModalVisible = (visible) => {
    //     this.setState({helpModalVisible: visible})
    // }

    // setRaiseModalVisible = (visible) => {
    //     this.setState({raiseModalVisible: visible})
    // }

    showChat = () => {
        let chat = this.state.show_chat
        this.setState({ show_chat: !chat });
    }

    componentDidMount() {
        //global.room.send("message", 'mounted') // DEBUG PURPOSES
        console.log('Lobby mounted')
        //loadLobbyInfo(this, global.room);
        //this.updatePlayers(global.room.state.players) // render players in current state
        if (global.room.state.game_started == true) this.setState({game_started: true})

        initListeners(this);
        //renderPlayerHand(global.room.state);

        room.onMessage("error", (e) => {
            this.setState({errorMessage: e})
        })
    }

    componentWillUnmount() {
        global.room.leave()
    }

    render() {
        return (
            <View style={[common.container, {backgroundColor: '#c1c9c4'}]}>      
            <Background position='absolute' preserveAspectRatio="xMinYMin slice"/>
                <View style={common.navBar}>
                    <TouchableOpacity style={common.navButton} onPress={() => this.props.navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}><MaterialCommunityIcons name="keyboard-backspace" size={normaliseFont(40)} color="white" /></Text></TouchableOpacity>
                    <Image style={common.navLogo} source={require('../../assets/Logo.png')} />
                    <TouchableOpacity style={common.navButton} onPress={() => this.showChat()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}><MaterialCommunityIcons name="chat-processing" size={normaliseFont(40)} color="white" /></Text></TouchableOpacity>
                    <Chat modalVisible={this.state.show_chat} setModalVisible={this.showChat} messages={this.state.chat_messages} />
                </View>
                <View>
                <ScrollView horizontal={true} style={styles.playerScroller}>
                    {<View style={{margin: 0}}>
                        <PlayerCards players={this.state.players} current_player={this.state.current_player} />
                    </View>}
                </ScrollView>
                </View>

                <View style={styles.gameContainer}>
                    <View style={styles.board}>
                        {this.state.error &&
                        <View style={common.errorMessage}>
                            {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                        </View>}
                        <FlashDisplayer notifications={this.state.notifications} />
                        {!this.state.game_started && LobbyInfo(this)}
                        {this.state.game_started &&
                        <View style={{ flex: 1, flexDirection: 'column'}}>
                            <Table cards={this.state.community_cards} pot={this.state.pot}/>
                            <PlayerHand cards={this.state.player_hand}/>
                        </View>}
                    </View>
                </View>
                <GameOptions current_bet={this.state.current_bet} largest_bet={this.state.largest_bet} chips={this.state.chips} game_started={this.state.game_started} show_options={this.state.show_options} showOptions={this.showOptions} changeReadyState={this.changeReadyState} />
            </View>
        )
    }
}
