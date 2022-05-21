import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import { styles } from '../styles/lobby'

export function LobbyInfo(component) {
    return (
        <View>
            <View style={styles.roomCodeContainer}>
                <Text style={styles.heading}>Join code:</Text>
                <Text style={styles.gameCode}>{component.state.room_id}</Text>
            </View>
            <View style={styles.gameInfoParentContainer}>
                <Text style={styles.heading}>Game Rules:</Text>
                <View style={styles.gameInfoContainer}>
                    <View style={styles.gameInfoLabels}>
                        <Text style={styles.gameInfoLabels}>Stake:</Text>
                        <Text style={styles.gameInfoLabels}>Amount:</Text>
                        <Text style={styles.gameInfoLabels}>Starting Stack:</Text>
                        <Text style={styles.gameInfoLabels}>Big Blind:</Text>
                        <Text style={styles.gameInfoLabels}>Small Blind:</Text>
                    </View>
                    <View style={styles.gameInfo}>
                        <Text style={styles.gameInfo}>{global.room.state.stake}</Text>
                        <Text style={styles.gameInfo}>{global.room.state.amount}</Text>
                        <Text style={styles.gameInfo}>{global.room.state.chips}</Text>
                        <Text style={styles.gameInfo}>{global.room.state.b_blind}</Text>
                        <Text style={styles.gameInfo}>{global.room.state.s_blind}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}