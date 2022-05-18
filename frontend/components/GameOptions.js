import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from '../styles/lobby'
import { playerAction } from '../components/GameHelper'
import { normaliseHeight, normaliseWidth } from '../styles/normalize'
import { Entypo } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { auth } from '../firebase'

export default class GameOptions extends Component {
    constructor(props) {
        super(props)
    }

    playerCheck = () => {
        console.log(auth.currentUser.uid, ' is checking ')
        //global.room.send("playerTurn", {action: 'check'})
        playerAction(global.room, 'check', 0)
    }

    playerBet = (amount) => {
        console.log(auth.currentUser.uid, ' is raising ', amount)
        //global.room.send("playerTurn", {action: 'bet', amount: amount})
        playerAction(global.room, 'raise', amount)
    }

    playerFold = () => {
        console.log(auth.currentUser.uid, ' is folding ')
        //global.room.send("playerTurn", {action: 'fold'})
        playerAction(global.room, 'fold', 0)
    }

    render() {
        return (
            <View style={[styles.footer, (this.props.show_options) ? {bottom: 0}:{bottom: normaliseHeight(-140)}]}>
                {!this.props.game_started &&
                <TouchableOpacity style={styles.readyButton} onPress={this.props.changeReadyState}>
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Vote to Start</Text>
                </TouchableOpacity>}
                <View style={styles.menuOptions}>
                    {this.props.game_started &&
                    <View style={styles.expandOptionsButton}>
                    <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(50), textAlign: 'center'  }} onPress={this.showOptions}>{this.props.chips}</Text>
                        <TouchableOpacity onPress={this.props.showOptions}>
                            <Text style={{ color: '#FFF', fontWeight: '500', width: normaliseWidth(292), textAlign: 'center' }} onPress={this.showOptions}>
                                {this.props.show_options ? (<Entypo name="chevron-thin-down" size={32} color="black" />) : (<Entypo name="chevron-thin-up" size={32} color="black" />)}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(50), textAlign: 'center'  }} onPress={this.showOptions}>
                                <MaterialCommunityIcons name="help-circle-outline" size={32} color="black" />
                            </Text>
                        </TouchableOpacity>
                    </View>}
                    
                    {this.props.game_started &&
                    <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerCheck()}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Check</Text>
                    </TouchableOpacity>}
                    {this.props.game_started &&
                    <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerBet(100)}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Raise</Text>
                    </TouchableOpacity>}
                    {this.props.game_started &&
                    <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerFold()}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Fold</Text>
                    </TouchableOpacity>}
                </View>
            </View>
        )
    }
}
