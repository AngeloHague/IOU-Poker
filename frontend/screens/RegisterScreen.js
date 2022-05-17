import React, { Component } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView } from 'react-native'
import firebase from 'firebase/app'
import 'firebase/auth'

import { auth } from '../firebase'

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
                style={styles.container}
            >
                <ScrollView>
                <Text style={styles.greeting}>{'Right then.\nLet\'s make you an account.'}</Text>

                <View style={styles.errorMessage}>
                    {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
                </View>

                <View style={styles.form}>
                    <View>
                        <Text style={styles.inputTitle}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            textContentType='name'
                            onChangeText={name => this.setState({ name })}
                            value={this.state.name}
                        />
                    </View>
                    <View style={{ marginTop: 32 }}>
                        <Text style={styles.inputTitle}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            autocapitalize='none'
                            textContentType='emailAddress'
                            keyboardType='email-address'
                            onChangeText={email => this.setState({ email })}
                            value={this.state.email}
                        />
                    </View>
                    <View style={{ marginTop: 32 }}>
                        <Text style={styles.inputTitle}>Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            autocapitalize='none'
                            textContentType='password'
                            onChangeText={password => this.setState({ password })}
                            value={this.state.password}
                        />
                    </View>
                    <View style={{ marginTop: 32 }}>
                        <Text style={styles.inputTitle}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            autocapitalize='none'
                            textContentType='password'
                            onChangeText={confirm => this.setState({ confirm })}
                            value={this.state.confirm}
                        />
                    </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={this.handleSignUp}>
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 32 }}>
                    <Text
                    style={{ color: '#414959', fontSize: 13 }}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    greeting: {
        marginTop: 32,
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center'
    },
    errorMessage: {
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 30
    },
    error: {
        color: '#E9446A',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center'
    },
    form: {
        marginBottom: 48,
        marginHorizontal: 30
    },
    inputTitle: {
        color: '#8A8F9E',
        fontSize: 10,
        textTransform: 'uppercase'
    },
    input: {
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
