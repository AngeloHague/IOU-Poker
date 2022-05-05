import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
import { styles } from '../styles/lobby';

// LOAD LOBBY INFO
// export function loadLobbyInfo(component, state) {
//     // let stake = room.state.stake;
//     // let amount = room.state.amount;
//     // let starting_stack = room.state.chips;
//     // let b_blind = room.state.b_blind;
//     // let s_blind = room.state.s_blind;
    
//     let {stake, amount, chips, b_blind, s_blind} = state;
//     console.log('Lobby Info Loaded:')
//     console.log('Stake: ', stake)
//     console.log('Amount: ', amount)
//     console.log('Starting Stack: ', chips)
//     console.log('Big Blind: ', b_blind)
//     console.log('Small Blind: ', s_blind)
// }

// UPDATE THE LIST OF PLAYERS
export function updatePlayers(component, players) {
    let _players = []
      players.forEach((player) => {
        //console.log(`${key}'s name: ${player['name']}`)
        //console.log(`${key}'s uid: ${player['uid']}`)
        //console.log(`${key}'s ready state: ${player['ready']}`)
        let _player = {
            name: player['name'],
            uid: player['uid'],
            sid: player['sessionId'],
            ready: player['ready'],
            chips: player['chips'],
            folded: player['folded'],
        }
        _players.push(_player)
    })
    component.setState({player_html: renderPlayers(component.state, _players)})
}


// RENDER THE PLAYERS ON THE CLIENT
export function renderPlayers(state, players) {
    state.players = players
    let started = state.game_started
    return (
        <View style={styles.playerContainer}>
        {players.map(function(player, idx){
            return (<View key={player.sid} style={[styles.playerCard, (!room.state.game_started && player.ready) ? {borderColor: '#b4f56c'}:{borderColor: '#E9446A'}]}>
                <Text style={styles.playerName}>{player.name}</Text>
                <View style={styles.cardContainer}>
                    <View>
                        <Image style={styles.card1} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
                    </View>
                    <View>
                        <Image style={styles.card2} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
                    </View>
                </View>
                <View>
                    {!started && <Text style={styles.playerStatus}>{player.ready ? 'Ready':'Not Ready'}</Text>}
                    {started && <Text style={styles.playerStatus}>{player.chips}</Text>}
                    
                </View>
            </View>)
         })}
        </View>
      )
}

export function renderCommunityCards(component, state) {
    let cards = state.community_cards
    if (cards.length == 5) {
        if (cards[4].revealed === true) {
            component.setState({community_cards_html: (
                <View>
                    <Text style={styles.communityCards}>
                        {cards[0].value} {cards[1].value} {cards[2].value} {cards[3].value} {cards[4].value} 
                    </Text>
                </View>
            )})
        } else if (cards[3].revealed === true) {
            component.setState({community_cards_html: (
                <View>
                    <Text style={styles.communityCards}>
                        {cards[0].value} {cards[1].value} {cards[2].value} {cards[3].value} ??
                    </Text>
                </View>
            )})
        } else if (cards[0].revealed === true) {
            component.setState({community_cards_html: (
                <View>
                    <Text style={styles.communityCards}>
                        {cards[0].value} {cards[1].value} {cards[2].value} ?? ??
                    </Text>
                </View>
            )})
        } else {
            component.setState({community_cards_html: (
                <View>
                    <Text style={styles.communityCards}>
                        ?? ?? ?? ?? ??
                    </Text>
                </View>
            )})
        }
    }
};

export function renderPlayerHand(component, state) {
    let cards = state.players.get(room.sessionId).cards
    if (cards.length == 2) {
        component.setState({player_hand_html: (
            <View>
                <Text style={styles.gameCode}>{
                    cards[0].value} {cards[1].value}
                </Text>
            </View>
        )})
    }
};

// COMMUNICATE PLAYER ACTION WITH SERVER
export function playerAction(room, action, amount) {
    room.send("playerTurn", {action: action, amount: amount})
}