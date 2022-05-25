import React, { PureComponent, Component } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native'
import { styles } from '../styles/lobby'
import { playerAction } from '../components/Listeners'
import { normaliseFont, normaliseHeight, normaliseWidth } from '../styles/normalize'
import { Entypo } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { auth } from '../firebase'
import common, { poker_red } from '../styles/common'
import Card from './Card'

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
        this.props.setModalVisible()
    }

    closeWindow = () => {
        this.setState({amount: 0})
        this.props.setModalVisible()
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
                        <TouchableOpacity onPress={this.closeWindow} style={{width: normaliseWidth(47)}}>
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
        this.hands = [
            ['Royal Flush',['AS','KS','QS','JS','TS']],
            ['Straight Flush',['9H','8H','7H','6H','5H']],
            ['Four of a Kind',['AC','AH','AS','AD','3S']],
            ['Full House',['KH','KS','KD','JC','JD']],
            ['Flush',['AS','QS','JS','6S','2S']],
            ['Straight',['9D','8S','7H','6C','5D']],
            ['Three of Kind',['4H','4S','4D','8C','AD']],
            ['Two Pair',['AS','AH','QC','QD','5C']],
            ['Pair',['AD','AC','7H','5S','3D']],
            ['High Card',['AS','QH','TC','5H','3S']],
        ]
    }

    renderHand(hand, idx) {
        let [title, values] = hand
        let cards = [];
        if (values.length >= 1) {
            values.forEach((val) => {
                cards.push({value: val})
            })
            return (cards.length == 5) ? <View key={'PokerHand_'+idx}>
            <Text style={{fontSize: normaliseFont(14), fontWeight: 'bold', color: (idx % 2 == 0) ? poker_red : 'black'}}>{idx+1}. {title}</Text>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <Card card={cards[0]} style={[styles.card, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}  />
                <Card card={cards[1]} style={[styles.card, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}  />
                <Card card={cards[2]} style={[styles.card, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}  />
                <Card card={cards[3]} style={[styles.card, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}  />
                <Card card={cards[4]} style={[styles.card, { width: normaliseWidth(45), height: normaliseWidth(60) }]} small={true}  />
            </View>
        </View> : <></>
        } else {
            return <></>
        }
        
    }

    renderPokerHands(hands) {
        const components = []
        {[...hands].map((hand, idx) => {
            components.push(this.renderHand(hand, idx))
        })}
        return components
    }

    render() {
        return(
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
                <View style={[styles.modalView, styles.modalChat]}>
                    <View style={{width: '100%', flex: 0, flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <View />
                    <TouchableOpacity onPress={this.props.setModalVisible} style={{width: normaliseWidth(47)}}>
                        <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(47), textAlign: 'center'  }}>
                            <MaterialCommunityIcons name="close" size={normaliseWidth(26)} color="black" />
                        </Text>
                    </TouchableOpacity>
                    </View>
                    <Text style={styles.modalText}>Hand Rankings</Text>
                    <ScrollView style={{width: '100%'}}
                    ref={ref => this.scrollView = ref}>
                        {this.renderPokerHands(this.hands)}
                    </ScrollView>
                </View>
            </View>
        </Modal>
        )
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
    constructor(props) {
        super(props)
    }

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
