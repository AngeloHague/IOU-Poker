import React, { PureComponent, Component } from 'react'
import { View, Text, Image } from 'react-native'
import { styles } from '../styles/lobby'
import { normaliseFont, normaliseWidth } from '../styles/normalize';
import Card from './Card';
import { poker_red } from '../styles/common';


class PlayerCard extends PureComponent {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        console.log('Card mounted: ', this.props.player.sid)
    }

    render() {
        let borderColor
        if (!room.state.game_started) {
            borderColor = this.props.player.ready ? '#b4f56c' : '#E9446A'
        } else {
            borderColor = (this.props.current_player === this.props.player.sid) ? '#2b37b5' : poker_red
        }
        
        return (
        <View style={[styles.playerCard, {borderColor: borderColor}]}>
        <Text style={styles.playerName}>{this.props.player.name}</Text>
            {/* <Text style={styles.playerName}>{this.props.player.name}</Text> */}
            {(this.props.player.cards.length == 2) ? <View style={styles.cardContainer}>
                <View >
                    <Card card={this.props.player.cards[0]} style={[styles.card, styles.card1, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}  />
                </View>
                <View >
                    <Card card={this.props.player.cards[1]} style={[styles.card, styles.card2, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}  />
                </View>
            </View> : <View style={styles.cardContainer}>
                <View >
                    <Card card={{value: undefined}} style={[styles.card, styles.card1, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}   />
                </View>
                <View >
                    <Card card={{value: undefined}} style={[styles.card, styles.card2, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}   />
                </View>
            </View>}
            <View style={{flex: 0, flexDirection: 'row', justifyContent: 'space-around'}}>
                {!room.state.game_started ? (<Text style={styles.playerStatus}>Ready:</Text>) : (<Text style={styles.playerStatus}>{this.props.player.chips}</Text>)}
                {!room.state.game_started ? (<Text style={styles.playerStatus}>{this.props.player.ready ? 'Yes':'No'}</Text>) : (<Text></Text>)}
                {room.state.game_started && <Text style={styles.playerStatus}>{this.props.player.current_bet}</Text>}
            </View>
        </View>
        )
    }
}


export default class PlayerCards extends Component {
    constructor(props) {
        super(props)
    }

    renderPlayers(players, current_player) {
        const components = []
        {[...players.values()].map(player => {
            components.push(<PlayerCard key={player.sid} player={player} current_player={current_player} />)
        })}
        return components
    }

    render() {
        return (
            <View style={styles.playerContainer}>
                {this.renderPlayers(this.props.players, this.props.current_player)}
            </View>
        )
    }
}
