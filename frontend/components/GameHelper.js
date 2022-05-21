import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image, Animated } from 'react-native'
import { styles } from '../styles/lobby';
import { normaliseFont, normaliseWidth } from '../styles/normalize';
import { CARD_IMG_RENDER_MAP } from './renderCards';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const CARD_FILE_MAP = new Map([
    ['2C','c02.png'],
    ['3C','c03.png'],
    ['4C','c04.png'],
    ['5C','c05.png'],
    ['6C','c06.png'],
    ['7C','c07.png'],
    ['8C','c08.png'],
    ['9C','c09.png'],
    ['10C','c10.png'],
    ['JC','c11.png'],
    ['QC','c12.png'],
    ['KC','c13.png'],
    ['AC','c01.png'],
])

// UPDATE THE LIST OF PLAYERS
export function updatePlayers(component, players) {
    //const _players = []
    const _players = component.state.players
    players.forEach((player) => {
        const _player = {
            name: player['name'],
            uid: player['uid'],
            sid: player['sessionId'],
            ready: player['ready'],
            chips: player['chips'],
            current_bet: player['current_bet'],
            folded: player['folded'],
            cards: player['cards'],
        }
        _players.set(_player.sid, _player)
    })
    component.setState({players: _players})
}

// // RENDER THE PLAYERS ON THE CLIENT
// export function renderPlayers(state, players) {
//     state.players = players
//     let started = state.game_started
//     return (
//         <View style={styles.playerContainer}>
//         {players.map(function(player, idx) {
//             console.log('Rendering Player Card', player.sid)
//             return (
//                 <PlayerCard key={player.sid} player={player} />
//             // <View key={player.sid} style={[styles.playerCard, (!room.state.game_started && player.ready) ? {borderColor: '#b4f56c'}:{borderColor: '#E9446A'}]}>
//             //     <Text style={styles.playerName}>{player.name}</Text>
//             //     <View style={styles.cardContainer}>
//             //         <View>
//             //             <Image style={[styles.card, styles.card1]} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
//             //         </View>
//             //         <View>
//             //             <Image style={[styles.card, styles.card2]} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
//             //         </View>
//             //     </View>
//             //     <View>
//             //         {!started && <Text style={styles.playerStatus}>{player.ready ? 'Ready':'Not Ready'}</Text>}
//             //         <Text style={styles.playerStatus}>{player.chips}</Text>
//             //         {/* <NumberTicker
//             //         number={chips}
//             //         textSize={40}
//             //         duration={1500}
//             //         textStyle={{fontWeight: 'bold', color: 'white'}}
//             //         /> */}
                    
//             //     </View>
//             // </View>
//             )
//          })}
//         </View>
//       )
// }

export function renderCard(card) {
    if (card.value == undefined) {
        return(
            <View style={styles.card}>
                <Text style={styles.cardValue}>{}</Text>
                <View style={styles.cardSuit}>
                    <Text>{}</Text>
                </View>
            </View>
        )
    } else {
        const [value, suit] = card.value.split('',2)
        let _suit, _color;
        switch(suit) {
            case 'C':
                _suit = (<MaterialCommunityIcons name="cards-club" size={normaliseWidth(30)} color="black" />)
                _color = 'black'
                break;
            case 'D':
                _suit = (<MaterialCommunityIcons name="cards-diamond" size={normaliseWidth(30)} color="red" />)
                _color = 'red'
                break;
            case 'H':
                _suit = (<MaterialCommunityIcons name="cards-heart" size={normaliseWidth(30)} color="red" />)
                _color = 'red'
                break;
            case 'S':
                _suit = (<MaterialCommunityIcons name="cards-spade" size={normaliseWidth(30)} color="black" />)
                _color = 'black'
                break;
            default:
                _suit = '?'
                _color = 'black'
                break;
        }
        return(
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardValue,{color: _color}]}>{value}</Text>
                </View>
                <View style={styles.cardSuit}>
                    <Text style={styles.cardSuit}>{_suit}</Text>
                </View>
                
                <View style={styles.cardFooter}></View>
            </View>
        )
    }
}

export function updateChips(previous, value) {

}

export function renderCommunityCards(component, state) {
    let cards = state.community_cards
    if (cards.length == 5) {
        
        component.setState({community_cards_html: (
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                {renderCard(cards[0])}
                {renderCard(cards[1])}
                {renderCard(cards[2])}
                {renderCard(cards[3])}
                {renderCard(cards[4])}
            </View>
        )})
    }
};

export function renderPlayerHand(component, state) {
    let cards = state.players.get(room.sessionId).cards
    if (cards.length == 2) {
        component.setState({player_hand_html: (
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                {renderCard(cards[0])}
                {renderCard(cards[1])}
            </View>
        )})
    }
};

// COMMUNICATE PLAYER ACTION WITH SERVER
export function playerAction(room, action, amount) {
    room.send("playerTurn", {action: action, amount: amount})
}