import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import { ScrollView } from 'react-native-gesture-handler'
import common from '../../styles/common'
import { auth }  from '../../firebase'
import Background from '../../assets/background.svg'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normaliseFont } from '../../styles/normalize'

export default class GameCreateScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }
    constructor(props) {
        super(props)

        this.creating = false;
        

        this.state = {
            game_id: '',
            stage: 'creating',  //Stage of the game
            players: [],        //Array of players
            startingStack: '3000',   //Starting no. of chips per player
            bigBlind: '50',       //Big Blind
            smallBlind: '25',     //Small Blind
            stake: '',          //Small Blind
            amount: '',         //Buy-in info
            errorMessage: null
        }
    }

    //Messy game creation: functional for low numbers of users.
    //1,679,616 possible games:
    createGame = async () => {
        if (!this.creating) { //Prevent spam-calling function
            this.creating = true
            let { startingStack, bigBlind, smallBlind, stake, amount } = this.state
            if (!(Boolean(startingStack)) || !(Boolean(bigBlind)) || !(Boolean(smallBlind))) {
                this.setState({ errorMessage: 'Please ensure that the Starting Chips, Big Blind and Small Blind fields all have values.' })
                this.creating = false
            } else {
                let { uid, displayName } = auth.currentUser
                try {
                    if (!stake || stake == ' ') stake = ''
                    if (!amount || amount == ' ') amount = 0
                    let settings = {
                        uid: uid,
                        name: displayName,
                        stake: String(stake),
                        amount: amount,
                        chips: startingStack,
                        b_blind: bigBlind,
                        s_blind: smallBlind
                    }
                    global.room = await global.client.create("game", {settings})
                    //console.warn("Created successfully", global.room.id)
                    this.props.navigation.navigate('GameLobby', {room_id: global.room.id})
                    this.creating = false
                }
                catch (e) {
                    console.error("create game error", e)
                    this.setState({ errorMessage: 'Failed to create room.'})
                    this.creating = false
                }
            }
        }
    }

    render() {
        return (
            <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} style={common.container}>
            <Background position='absolute' preserveAspectRatio="xMinYMin slice"/>
                <View style={common.navBar}>
                    <TouchableOpacity style={common.navButton} onPress={() => this.props.navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}><MaterialCommunityIcons name="keyboard-backspace" size={normaliseFont(40)} color="white" /></Text></TouchableOpacity>
                    <Image style={common.navLogo} source={require('../../assets/Logo.png')} />
                    <TouchableOpacity style={common.navButton} disabled={true}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}></Text></TouchableOpacity>
                </View>
                <ScrollView>
                <Text style={styles.greeting}>{'Okay.\nLet\'s make a lobby.'}</Text>

                <View style={common.errorMessage}>
                    {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                </View>

                <View style={common.form}>
                    <View>
                        <Text style={common.inputTitle}>What's at stake?</Text>
                        <TextInput
                            style={common.input}
                            placeholder='Leave blank to play gamble-free'
                            onChangeText={stake => this.setState({ stake })}
                            value={this.state.stake}
                        />
                    </View>
                    <View style={{ marginTop: 16 }}>
                        <Text style={common.inputTitle}>How much?</Text>
                        <TextInput
                            style={common.input}
                            placeholder='Leave blank to play gamble-free'
                            onChangeText={amount => this.setState({ amount })}
                            value={this.state.amount}
                        />
                    </View>
                    <View style={{ marginTop: 16 }}>
                        <Text style={common.inputTitle}>How many chips will each player get?</Text>
                        <TextInput
                            style={common.input}
                            defaultValue='3000'
                            keyboardType='numeric'
                            onChangeText={startingStack => this.setState({ startingStack: startingStack.replace(/[^0-9]/g, '') })}
                            value={this.state.startingStack}
                        />
                    </View>
                    <View style={{ marginTop: 16 }}>
                        <Text style={common.inputTitle}>Big Blind</Text>
                        <TextInput
                            style={common.input}
                            defaultValue='50'
                            keyboardType='numeric'
                            onChangeText={bigBlind => this.setState({ bigBlind: bigBlind.replace(/[^0-9]/g, '') })}
                            value={this.state.bigBlind}
                        />
                    </View>
                    <View style={{ marginTop: 16 }}>
                        <Text style={common.inputTitle}>Small Blind</Text>
                        <TextInput
                            style={common.input}
                            defaultValue='25'
                            keyboardType='numeric'
                            onChangeText={smallBlind => this.setState({ smallBlind: smallBlind.replace(/[^0-9]/g, '') })}
                            value={this.state.smallBlind}
                        />
                    </View>
                </View>
                <TouchableOpacity style={common.button} onPress={this.createGame} disabled={this.creating}>
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Create Game</Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                </ScrollView>
                
            </KeyboardAvoidingView>
        )
    }
}


const styles = StyleSheet.create({
    greeting: {
        marginTop: 32,
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center'
    }
})
