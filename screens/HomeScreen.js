import React, { Component } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, ScrollView, Image } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'

export default class HomeScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }

    state = {
        email: '',
        displayName: ''
    }

    componentDidMount() {
        const {email, displayName} = firebase.auth().currentUser

        this.setState({email, displayName})
    }

    signOutUser = () => {
        firebase.auth().signOut()
    }


    render() {
        return (
            <View style = {styles.container} >
                <View style = {styles.mainMenu} >
                    <Image style={styles.bigLogo} source={require('../assets/Logo.png')} />
                    <Text style={styles.greeting}>Hi {this.state.displayName}!</Text>
                    <View style={styles.divider} />
                </View>
                <TouchableOpacity style={styles.button} onPress={this.signOutUser}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Log Out</Text>
                    </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bigLogo: {
      width: 189,
      height: 150,
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
        backgroundColor: '#E9446A',
        borderRadius: 4,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center'
    }
})
