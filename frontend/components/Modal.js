import React, { PureComponent, Component } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native'
import { styles } from '../styles/lobby'
import { playerAction } from '../components/GameHelper'
import { normaliseFont, normaliseHeight, normaliseWidth } from '../styles/normalize'
import { Entypo } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { auth } from '../firebase'
import common, { poker_red } from '../styles/common'

export class Raise extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            amount: 0,
        }
    }

    alterAmount = (amount) => {
        let _amount = this.state.amount + amount
        this.setState({amount: (_amount > this.props.chips) ? this.props.chips : _amount})
    }

    playerBet = (amount) => {
        console.log(auth.currentUser.uid, ' is raising ', amount)
        //global.room.send("playerTurn", {action: 'bet', amount: amount})
        playerAction(global.room, 'raise', amount)
        this.setState({amount: 0}) 
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.props.modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    this.setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, styles.modalRaise]}>
                        <View style={{width: '100%', flex: 0, flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <View />
                        <TouchableOpacity onPress={this.props.setModalVisible} style={{width: normaliseWidth(47)}}>
                            <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(47), textAlign: 'center'  }}>
                                <MaterialCommunityIcons name="close" size={normaliseWidth(26)} color="black" />
                            </Text>
                        </TouchableOpacity>
                        </View>
                        <Text style={styles.modalText}>Raise by how much?</Text>
                    <View style={{width: '100%', flex: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: normaliseFont(24)}}>{this.props.current_bet} + </Text>
                        <Text style={{fontSize: normaliseFont(24)}}>{this.state.amount} = </Text>
                        <Text style={{fontSize: normaliseFont(24)}}>{this.props.current_bet + this.state.amount} </Text>
                    </View>
                    <View style={{width: '100%', paddingVertical: normaliseHeight(10), flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(-10)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>-10</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(-5)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>-5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(-1)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>-1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(+1)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>+1</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(+5)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>+5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(+10)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>+10</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: '100%', paddingVertical: normaliseHeight(10), flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(-1000)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>-1000</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(-100)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>-100</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(-50)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>-50</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(+50)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>+50</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(+100)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>+100</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(49)}]} onPress={() =>{this.alterAmount(+1000)}}>
                            <Text style={{ color: '#FFF', fontWeight: '500' }}>+1000</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.modalButton} onPress={() =>{this.playerBet(this.state.amount)}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Raise</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}

export class HandRankings extends PureComponent {
    constructor(props) {
        super(props)
    }
    render() {
        <></>
    }
}

export class Controls extends PureComponent {
    constructor(props) {
        super(props)
    }
    render() {
        <></>
    }
}

export class Help extends PureComponent {

    // componentDidMount() {
    //     console.log('Modal Help mounted')
    // }

    // componentDidUpdate() {
    //     console.log('Modal Help updated')
    // }

    showHandRankingsHelp = () => {

    }

    showControlsHelp = () => {

    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.props.modalVisible}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    this.setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, styles.modalHelp]}>
                        <View style={{width: '100%', flex: 0, flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <View />
                        <TouchableOpacity onPress={this.props.setModalVisible} style={{width: normaliseWidth(47)}}>
                            <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(47), textAlign: 'center'  }}>
                                <MaterialCommunityIcons name="close" size={normaliseWidth(26)} color="black" />
                            </Text>
                        </TouchableOpacity>
                        </View>
                        <Text style={styles.modalText}>What do you need help with?</Text>
                    
                    <TouchableOpacity style={styles.modalButton} onPress={() =>{this.showHandRankingsHelp}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Hand Rankings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={() =>{this.showControlsHelp}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Controls</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}
