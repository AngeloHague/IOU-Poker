import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../styles/lobby'
import Card from './Card'

export default class Table extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        console.log('Table Mounted:',this.props.cards.length)
    }

    render() {
        
        if (this.props.cards.length == 5) {
            return (
            <View style={styles.commCardContainer}>
                <Text style={styles.heading}>{'Community Cards:'}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <Card card={this.props.cards[0]} style={styles.card} />
                    <Card card={this.props.cards[1]} style={styles.card} />
                    <Card card={this.props.cards[2]} style={styles.card} />
                    <Card card={this.props.cards[3]} style={styles.card} />
                    <Card card={this.props.cards[4]} style={styles.card} />
                </View>
                <Text style={styles.heading}>{this.props.pot}</Text>
            </View>
        )} else {return(
            <View style={styles.commCardContainer}>
                <Text style={styles.heading}>{'Community Cards:'}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}></View>
                <Text style={styles.heading}>{this.props.pot}</Text>
            </View>
        )}
    }
}
