import React, { PureComponent, Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../styles/lobby'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { normaliseFont, normaliseWidth } from '../styles/normalize'
import { poker_red } from '../styles/common'

export default class Card extends Component {
    // componentDidUpdate() {
    //     console.log('Card component updated')
    // }

    render() {
        if (this.props.card.value == undefined) {
            return(
                <View style={this.props.style}>
                    <Text style={styles.cardValue}>{}</Text>
                    <View style={styles.cardSuit}>
                        <Text>{}</Text>
                    </View>
                </View>
            )
        } else {
            let [fontSize, iconSize, suitSize] = (this.props.large) ? [normaliseFont(25), normaliseWidth(17), normaliseWidth(45)] : [normaliseFont(18), normaliseWidth(15), normaliseWidth(35)]

            const [value, suit] = this.props.card.value.split('',2)
            let _value = (value=='T') ? '10' : value
            let _icon, _suit, _color;
            switch(suit) {
                case 'C':
                    _icon = (<MaterialCommunityIcons name="cards-club" size={iconSize} color="black" />)
                    _suit = (<MaterialCommunityIcons name="cards-club" size={suitSize} color="black" />)
                    _color = 'black'
                    break;
                case 'D':
                    _icon = (<MaterialCommunityIcons name="cards-diamond" size={iconSize} color={poker_red} />)
                    _suit = (<MaterialCommunityIcons name="cards-diamond" size={suitSize} color={poker_red}  />)
                    _color = poker_red 
                    break;
                case 'H':
                    _icon = (<MaterialCommunityIcons name="cards-heart" size={iconSize} color={poker_red}  />)
                    _suit = (<MaterialCommunityIcons name="cards-heart" size={suitSize} color={poker_red}  />)
                    _color = poker_red
                    break;
                case 'S':
                    _icon = (<MaterialCommunityIcons name="cards-spade" size={iconSize} color="black" />)
                    _suit = (<MaterialCommunityIcons name="cards-spade" size={suitSize} color="black" />)
                    _color = 'black'
                    break;
                default:
                    _suit = '?'
                    _color = 'black'
                    break;
            }
            if (this.props.small) return (
                <View style={this.props.style}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardValue,{color: _color, fontSize: fontSize}]}>{_value}</Text>
                    </View>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>{_icon}</Text>
                    </View>
                    <View style={{flex: 0.5}}>
                    </View>
                    
                    <View style={styles.cardFooter}></View>
                </View>
            )
            else return (
                <View style={this.props.style}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardValue,{color: _color, fontSize: fontSize}]}>{_value}</Text>
                    </View>
                    <View style={{flex: .5}}>
                        <Text style={styles.cardIcon}>{_icon}</Text>
                    </View>
                    <View style={styles.cardSuit}>
                        <Text style={styles.cardSuit}>{_suit}</Text>
                    </View>
                    
                    <View style={styles.cardFooter}></View>
                </View>
            )
        }
    }
}
