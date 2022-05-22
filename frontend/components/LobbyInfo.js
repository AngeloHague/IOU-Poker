import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import { styles } from '../styles/lobby'

export function LobbyInfo(component) {
    const stake = (global.room.state.stake == null || global.room.state.stake == 'null' || global.room.state.stake == '' || global.room.state.stake == ' ') ? 'Nothing' : (global.room.state.stake)
    const amount = global.room.state.amount
    const chips = global.room.state.chips
    const b_blind = global.room.state.b_blind
    const s_blind = global.room.state.s_blind
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
                        <Text style={styles.gameInfoLabels}>Stake </Text>
                        <Text style={styles.gameInfoLabels}>Amount </Text>
                        <Text style={styles.gameInfoLabels}>Chips </Text>
                        <Text style={styles.gameInfoLabels}>Big Blind </Text>
                        <Text style={styles.gameInfoLabels}>Small Blind </Text>
                    </View>
                    <View style={styles.gameInfo}>
                        <Text style={styles.gameInfo}>{stake}</Text>
                        <Text style={styles.gameInfo}>{amount}</Text>
                        <Text style={styles.gameInfo}>{chips}</Text>
                        <Text style={styles.gameInfo}>{b_blind}</Text>
                        <Text style={styles.gameInfo}>{s_blind}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}