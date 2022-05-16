import React, { Component } from 'react'
import { Text, TextInput, TouchableOpacity, StyleSheet, View, KeyboardAvoidingView, Image } from 'react-native'
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
                        <Image style={[styles.card, styles.card1]} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
                    </View>
                    <View>
                        <Image style={[styles.card, styles.card2]} source={require('../assets/playing-cards/Backs/Card-Back-01.png')} />
                    </View>
                </View>
                <View>
                    {!started && <Text style={styles.playerStatus}>{player.ready ? 'Ready':'Not Ready'}</Text>}
                    <Text style={styles.playerStatus}>{player.chips}</Text>
                    
                </View>
            </View>)
         })}
        </View>
      )
}

export function renderCard(card) {
    if (card.value == undefined) {
        // return ??
        let [value, suit] = '??'
        return(
            <View style={styles.card}>
                <Text style={styles.cardValue}>{value}</Text>
                <View style={styles.cardSuit}>
                    <Text>{suit}</Text>
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
        /*component.setState({community_cards_html: (
        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
            <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[0].value)} />
            <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[1].value)} />
            <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[2].value)} />
            <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[3].value)} />
            <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[4].value)} />
        </View>)})*/ /*
        if (cards[4].revealed === true) {
            component.setState({community_cards_html: (
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[0].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[1].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[2].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[3].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[4].value)} />
                </View>
            )})
        } else if (cards[3].revealed === true) {
            component.setState({community_cards_html: (
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[0].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[1].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[2].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[3].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[4].value)} />
                </View>
            )})
        } else if (cards[0].revealed === true) {
            component.setState({community_cards_html: (
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[0].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[1].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[2].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[3].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[4].value)} />
                </View>
            )})
        } else {
            component.setState({community_cards_html: (
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[0].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[1].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[2].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[3].value)} />
                    <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[4].value)} />
                    {/*<Text style={styles.communityCards}>
                        ?? ?? ?? ?? ??
            </Text>}
                </View>
            )})
        }*/
    }
};

// function renderCard(component, state) {
//     //
//     <View styles={style.flip-card}>
//         <View styles={style.flip-card-inner}>
//             <View styles={style.flip-card-front}>
//                 <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(undefined)} />
//             </View>
//             <View styles={style.flip-card-back}>
//                 <Image style={styles.communityCard} source={CARD_IMG_RENDER_MAP.get(cards[0].value)} />
//             </View>
//         </View>
//     </View>
// }

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