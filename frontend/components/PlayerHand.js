import React, { Component } from 'react'
import { View, Text } from 'react-native'
import { renderCard } from './GameHelper'
import { styles } from '../styles/lobby'
import Card from './Card'
import { normaliseWidth } from '../styles/normalize'

export default class PlayerHand extends Component {
    constructor(props) {
        super(props)
    }

    componentDidUpdate() {
        console.log('Player Hand component updated')
    }

    render() {
        if (this.props.cards.length == 2) {
            return (
                <View style={styles.playedHandContainer}>
                    <Text style={styles.heading}>{'Your Cards:'}</Text>
                    <View style={styles.playerHand}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                            {/* <Card card={this.props.cards[0]} style={[styles.card, { width: normaliseWidth(75), height: normaliseWidth(100) }]} large={true} />
                            <Card card={this.props.cards[1]} style={[styles.card, { width: normaliseWidth(75), height: normaliseWidth(100) }]} large={true} /> */}
                            <Card card={this.props.cards[0]} style={styles.card} />
                            <Card card={this.props.cards[1]} style={styles.card} />
                        </View>
                    </View>
                </View>
            )
            return (
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                    {renderCard(this.props.cards[0])}
                    {renderCard(this.props.cards[1])}
                </View>
            )
        } else return (<></>)
    }
}
