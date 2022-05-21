import React, { PureComponent, Component } from 'react'
import { View, Text, Image } from 'react-native'
import { renderCard } from './GameHelper'
import { styles } from '../styles/lobby'
import { normaliseFont, normaliseWidth } from '../styles/normalize';
import Card from './Card';


class PlayerCard extends PureComponent {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        console.log('Card mounted: ', this.props.player.sid)
    }

    render() {
        return (
        <View style={[styles.playerCard, (!room.state.game_started && this.props.player.ready) ? {borderColor: '#b4f56c'}:{borderColor: '#E9446A'}]}>
        <Text style={styles.playerName}>{this.props.player.sid}</Text>
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
            <View>
                {room.state.game_started ? (<Text style={styles.playerStatus}>{this.props.player.chips}</Text>) : (<Text style={styles.playerStatus}>{this.props.player.ready ? 'Ready':'Not Ready'}</Text>)}
            </View>
        </View>
        )
    }
}


export default class PlayerCards extends Component {
    constructor(props) {
        super(props)
    }

    renderPlayers(players) {
        const components = []
        {[...players.values()].map(player => {
            components.push(<PlayerCard key={player.sid} player={player} />)
        })}
        return components
    }

    render() {
        return (
            <View style={styles.playerContainer}>
                {this.renderPlayers(this.props.players)}
            </View>
        )
    }
}
