import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import { styles } from '../styles/lobby'

export function Table(component) {
    return (
        <View>
            {component.state.game_started &&
            <View style={styles.roomCodeContainer}>
                <Text style={styles.greeting}>{'Community Cards:'}</Text>
                {component.state.community_cards_html}
                <Text style={styles.greeting}>{component.state.pot}</Text>
            </View>}
            {component.state.game_started &&
            <View style={styles.gameInfoContainer}>
                <Text style={styles.greeting}>{'Your Cards:'}</Text>
                <View style={styles.yourCardContainer}>
                    {component.state.player_hand_html}
                </View>
            </View>}
            <View style={{ flex: 1 }} />
        </View>
    )
}