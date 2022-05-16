import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, Image } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import * as Colyseus from "colyseus.js"
import { preloadCards } from '../components/renderCards'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { normaliseHeight, normaliseWidth } from '../styles/normalize'

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
        const {email, displayName, uid} = firebase.auth().currentUser
        this.setState({email, displayName, uid})

        preloadCards()
    }

    signOutUser = () => {
        firebase.auth().signOut()
    }

    


    render() {
        return (
            <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style = {styles.container} >
                <ScrollView>
                <View style = {styles.mainMenu} >
                    <Image style={styles.bigLogo} source={require('../assets/Logo.png')} />
                    <Text style={styles.greeting}>Hi {this.state.displayName}!</Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-club" size={24} color="black" /></Text>
                    </View>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-diamond" size={24} color="red" /></Text>
                    </View>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-spade" size={24} color="black" /></Text>
                    </View>
                    <View styles={{width: normaliseWidth(25), height: normaliseHeight(25)}}>
                        <Text><MaterialCommunityIcons name="cards-heart" size={24} color="red" /></Text>
                    </View>
                </View>
                {/*<TouchableOpacity
                    style={styles.button}
                    onPress={() => this.props.navigation.navigate('Game', {game_id:'ZEn7JX4EPICO1otkNrnl'})}
                >
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Play Game</Text>
        </TouchableOpacity>*/}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.props.navigation.navigate('GameCreate')}
                >
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Create Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.props.navigation.navigate('GameJoin')}
                >
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Join Game</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => this.props.navigation.navigate('Debt')}
                >
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Manage Debts</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.signOutUser}
                >
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Log Out</Text>
                </TouchableOpacity>
                <View style={{ marginVertical: 10 }} />
                </ScrollView>
                <View style={{ flex: 1 }} />
            </KeyboardAvoidingView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    bigLogo: {
      width: 189,
      height: 150,
      marginTop: 50
    },
    greeting: {
        marginTop: 32,
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center'
    },
    mainMenu: {
        marginTop: 48,
        marginBottom: 48,
        marginHorizontal: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        borderBottomColor: '#8A8F9E',
        borderBottomWidth: StyleSheet.hairlineWidth,
        height: 40,
        fontSize: 15,
        color: '#161F3D'
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
