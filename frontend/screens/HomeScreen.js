import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, Image, Alert } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import * as Colyseus from "colyseus.js"
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { normaliseHeight, normaliseWidth } from '../styles/normalize'
import styles, { poker_red } from '../styles/common'
import Background from '../assets/background.svg'
import { auth } from '../firebase'
// import Background from '../assets/SVGs'

export default class HomeScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }

    state = {
        email: '',
        displayName: '',
        preloading: true,
    }

    componentDidMount() {
        const {email, displayName, uid} = auth.currentUser
        this.setState({email, displayName, uid})
    }

    signOutUser = () => {
        firebase.auth().signOut()
    }

    signOutAlert = () => { Alert.alert(
        "Are you sure?",
        "",
        [
            {
            text: "No",
            //onPress: () => console.log("Cancel Pressed"),
            style: "Cancel"
            },
            { text: "Yes", onPress: () => firebase.auth().signOut() }
        ]
    )}

    render() {
        return (
            <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style = {styles.container} >
            <Background position='absolute' style={{top: 0, left: 0}} preserveAspectRatio="xMinYMin slice"/>
                <ScrollView>
                <View style = {styles.mainMenu} >
                    <Image style={styles.bigLogo} source={require('../assets/Logo.png')} />
                    <Text style={styles.greeting}>So, {this.state.displayName}, what shall we do?</Text>
                </View>
                <View style={{flex: 1, width: '100%', marginBottom: normaliseHeight(32), flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-club" size={24} color="black" /></Text>
                    </View>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-diamond" size={24} color={poker_red} /></Text>
                    </View>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-spade" size={24} color="black" /></Text>
                    </View>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-heart" size={24} color={poker_red} /></Text>
                    </View>
                </View>
                {/*<TouchableOpacity
                    style={styles.button}
                    onPress={() => this.props.navigation.navigate('Game', {game_id:'ZEn7JX4EPICO1otkNrnl'})}
                >
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Play Game</Text>
        </TouchableOpacity>*/}
                <TouchableOpacity
                    style={[styles.button, {marginVertical: normaliseHeight(10)}]}
                    onPress={() => this.props.navigation.navigate('GameCreate')}
                >
                    <Text style={styles.buttonText}>Create a Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, {marginVertical: normaliseHeight(5)}]}
                    onPress={() => this.props.navigation.navigate('GameJoin')}
                >
                    <Text style={styles.buttonText}>Join a Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, {marginVertical: normaliseHeight(10)}]}
                    onPress={() => this.props.navigation.navigate('Debt')}
                >
                    <Text style={styles.buttonText}>Manage Debts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, {marginVertical: normaliseHeight(10)}]}
                    onPress={this.signOutAlert}
                >
                        <Text style={styles.buttonText}>Log Out</Text>
                </TouchableOpacity>
                <View style={{ marginVertical: 10 }} />
                </ScrollView>
                <View style={{ flex: 1 }} />
            </KeyboardAvoidingView>
        )
    }
}

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'flex-end'
//     },
//     bigLogo: {
//       width: 189,
//       height: 150,
//       marginTop: 50
//     },
//     greeting: {
//         marginTop: 32,
//         fontSize: 18,
//         fontWeight: '400',
//         textAlign: 'center'
//     },
//     mainMenu: {
//         marginTop: 48,
//         marginBottom: 48,
//         marginHorizontal: 30,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     divider: {
//         borderBottomColor: '#8A8F9E',
//         borderBottomWidth: StyleSheet.hairlineWidth,
//         height: 40,
//         fontSize: 15,
//         color: '#161F3D'
//     },
//     button: {
//         marginHorizontal: 30,
//         marginVertical: 10,
//         backgroundColor: '#E9446A',
//         borderRadius: 4,
//         height: 52,
//         alignItems: 'center',
//         justifyContent: 'center'
//     }
// })
