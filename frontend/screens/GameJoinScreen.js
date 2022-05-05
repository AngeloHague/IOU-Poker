import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import { ScrollView } from 'react-native-gesture-handler'
import common from '../styles/common'

export default class GameJoinScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }

    constructor(props) {
        super(props)

        this.joining = false
        

        this.state = {
            join_code: '',
            errorMessage: null
        }
    }

    joinGame = async () => {
        if (!this.joining) {
            this.joining = true
            let { join_code } = this.state
            if (!(Boolean(join_code))) {
                this.setState({ errorMessage: 'Please enter a join code.' })
                this.joining = false
            } else {
                let { uid, displayName } = firebase.auth().currentUser
                try {
                    let settings = {
                        uid: uid,
                        name: displayName
                    }
                    global.room = await global.client.joinById(join_code, {settings})
                    //console.warn("Join successfully", global.room.id)
                    this.props.navigation.navigate('GameLobby', {room_id: global.room.id})
                    this.joining = false
                }
                catch (e) {
                    //console.error("join game error", e)
                    this.setState({ errorMessage: e.toString()})
                    this.joining = false
                }
            }
        }
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"} style={common.container}>
                <View style={common.navBar}>
                    <TouchableOpacity style={common.navButton} onPress={() => this.props.navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}>Go Back</Text></TouchableOpacity>
                    <Image style={common.navLogo} source={require('../assets/Logo.png')} />
                    <TouchableOpacity style={common.navButton} disabled={true}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}></Text></TouchableOpacity>
                </View>
                <ScrollView style={{marginTop: 100}}>
                    <Text style={styles.greeting}>{'Okay.\nEnter a join code.'}</Text>

                    <View style={common.errorMessage}>
                        {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                    </View>

                    <View style={common.form}>
                        <View>
                            <Text style={common.inputTitle}>Join Code</Text>
                            <TextInput
                                style={common.input}
                                placeholder=' -   -   -   -'
                                autoCapitalize='characters'
                                textContentType='oneTimeCode'
                                onChangeText={join_code => this.setState({ join_code })}
                                value={this.state.join_code}
                            />
                        </View>
                    </View>
                    <TouchableOpacity style={common.button} onPress={this.joinGame} disabled={this.joining}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Join Game</Text>
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
    },
})
