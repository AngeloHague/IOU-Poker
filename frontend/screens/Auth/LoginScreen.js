import React, { Component } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import Background from '../../assets/background.svg'

import { auth } from '../../firebase'
import common from '../../styles/common'

export default class LoginScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }
    
    state = {
        email: '',
        password: '',
        errorMessage: null
    }

    handleLogin = () => {
        const { email, password } = this.state
        // firebase
        //     .auth()
        auth
            .signInWithEmailAndPassword(email, password)
            .catch(error => this.setState({ errorMessage: error.message }))
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={common.container}
            >
            <Background position='absolute' style={{top: 0, left: 0}} preserveAspectRatio="xMinYMin slice"/>
                <ScrollView>
                <StatusBar barStyle='light-content'></StatusBar>
                <Text style={common.paddedGreeting}>{'Hey there.\nCome on in.'}</Text>

                <View style={common.errorMessage}>
                    {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                </View>

                <View style={common.form}>
                    <View>
                        <Text style={common.inputTitle}>Email Address</Text>
                        <TextInput
                            style={common.input}
                            autocapitalize='none'
                            textContentType='emailAddress'
                            keyboardType='email-address'
                            onChangeText={email => this.setState({ email })}
                            value={this.state.email}
                        />
                    </View>
                    <View style={{ marginTop: 32 }}>
                        <Text style={common.inputTitle}>Password</Text>
                        <TextInput
                            style={common.input}
                            secureTextEntry
                            textContentType='password'
                            autocapitalize='none'
                            onChangeText={password => this.setState({ password })}
                            value={this.state.password}
                        />
                    </View>
                </View>

                <TouchableOpacity style={common.button} onPress={this.handleLogin}>
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ alignSelf: 'center', marginTop: 32 }}
                    onPress={() => this.props.navigation.navigate('Register')}
                >
                    <Text style={{ color: '#c0c0c0', fontSize: 13 }}>
                        Don't have an account? <Text style={{ fontWeight: '500', color: '#E9446A' }}>Sign up here</Text>
                    </Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}

// const styles = StyleSheet.create({
//     container: {
//         flex: 1
//     },
//     greeting: {
//         marginTop: 32,
//         fontSize: 18,
//         fontWeight: '400',
//         textAlign: 'center'
//     },
//     errorMessage: {
//         height: 72,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginHorizontal: 30
//     },
//     error: {
//         color: '#E9446A',
//         fontSize: 13,
//         fontWeight: '600',
//         textAlign: 'center'
//     },
//     form: {
//         marginBottom: 48,
//         marginHorizontal: 30
//     },
//     inputTitle: {
//         color: '#8A8F9E',
//         fontSize: 10,
//         textTransform: 'uppercase'
//     },
//     input: {
//         borderBottomColor: '#8A8F9E',
//         borderBottomWidth: StyleSheet.hairlineWidth,
//         height: 40,
//         fontSize: 15,
//         color: '#161F3D'
//     },
//     button: {
//         marginHorizontal: 30,
//         backgroundColor: '#E9446A',
//         borderRadius: 4,
//         height: 52,
//         alignItems: 'center',
//         justifyContent: 'center'
//     }
// })
