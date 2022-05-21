import React, { Component } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import * as firebase from 'firebase'
import Background from '../../assets/background.svg'

import { auth } from '../../firebase'

export default class LoadingScreen extends Component {
    componentDidMount() {
        // firebase.auth().
        auth
        .onAuthStateChanged(user => {
            this.props.navigation.navigate(user ? 'App' : 'Auth')
        })
    }
    render() {
        return (
            <View style={styles.container}>
                <Background position='absolute' preserveAspectRatio="xMinYMin slice"/>
                <Text>Loading...</Text>
                <ActivityIndicator size='large'></ActivityIndicator>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
