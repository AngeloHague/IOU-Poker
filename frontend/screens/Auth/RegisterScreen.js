import React, { Component } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'
import Background from '../../assets/background.svg'

import { auth, db } from '../../firebase'
import common from '../../styles/common'
import { normaliseHeight } from '../../styles/normalize'

export default class RegisterScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }
    
    state = {
        name: '',
        email: '',
        password: '',
        confirm: '',
        errorMessage: null
    }

    handleSignUp = () => {
        const { name, email, password, confirm } = this.state
        if (password != confirm) {
            this.setState({ errorMessage: 'Passwords do not match' })
        }
        else {
            // firebase
            //     .auth()
            auth
                .createUserWithEmailAndPassword(email, password)
                .then(userCredentials => {
                    return userCredentials.user.updateProfile({
                        displayName: name
                    })
                })
                .catch(error => this.setState({errorMessage: error.message}))
        }
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={common.container}
            >
            <Background position='absolute' style={{top: 0, left: 0}} preserveAspectRatio="xMinYMin slice"/>
                <ScrollView>
                <Text style={[common.paddedGreeting, {marginTop: normaliseHeight(75)}]}>{'Right then.\nLet\'s make you an account.'}</Text>

                <View style={common.errorMessage}>
                    {this.state.errorMessage && <Text style={common.error}>{this.state.errorMessage}</Text>}
                </View>

                <View style={common.form}>
                    <View>
                        <Text style={common.inputTitle}>Full Name</Text>
                        <TextInput
                            style={common.input}
                            textContentType='emailAddress'
                            onChangeText={name => this.setState({ name })}
                            value={this.state.name}
                        />
                    </View>
                    <View style={{ marginTop: 32 }}>
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
                            autocapitalize='none'
                            textContentType='password'
                            onChangeText={password => this.setState({ password })}
                            value={this.state.password}
                        />
                    </View>
                    <View style={{ marginTop: 32 }}>
                        <Text style={common.inputTitle}>Confirm Password</Text>
                        <TextInput
                            style={common.input}
                            secureTextEntry
                            autocapitalize='none'
                            textContentType='password'
                            onChangeText={confirm => this.setState({ confirm })}
                            value={this.state.confirm}
                        />
                    </View>
                </View>

                <TouchableOpacity style={common.button} onPress={this.handleSignUp}>
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 32 }}>
                    <Text
                    style={{ color: '#c0c0c0', fontSize: 13 }}
                        onPress={() => this.props.navigation.goBack()}
                    >
                        Already have an account? <Text style={{ fontWeight: '500', color: '#E9446A' }}>Sign In</Text>
                    </Text>
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        )
    }
}