import React, { PureComponent, Component } from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native'
import { styles } from '../styles/lobby'
import { playerAction } from '../components/Listeners'
import { normaliseHeight, normaliseWidth } from '../styles/normalize'
import { Entypo } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { auth } from '../firebase'
import { poker_red } from '../styles/common'
import { Raise } from './Modal'

class ModalHelp extends PureComponent {
    constructor(props) {
        super(props)
    }

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

class ModalRaise extends Component {

}

export default class GameOptions extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            show_options: false,
            show_help: false,
            show_raise: false,
        }
    }

    playerCheck = () => {
        console.log(auth.currentUser.uid, ' is checking ')
        //global.room.send("playerTurn", {action: 'check'})
        playerAction(global.room, 'check', 0)
    }

    playerFold = () => {
        console.log(auth.currentUser.uid, ' is folding ')
        //global.room.send("playerTurn", {action: 'fold'})
        playerAction(global.room, 'fold', 0)
    }

    showOptions = () => {
        let options = this.state.show_options
        this.setState({show_options: !options})
    }
    
    showHelp = () => {
        let help = this.state.show_help
        this.setState({ show_help: !help });
    }
    
    showRaise = () => {
        let raise = this.state.show_raise
        this.setState({ show_raise: !raise });
    }

    // componentDidUpdate() {
    //     console.log('Options component updated')
    // }

    render() {
        return (
            <View style={[styles.footer, (this.state.show_options) ? {bottom: normaliseHeight(-50)}:{bottom: normaliseHeight(-190)}]}>
                {!this.props.game_started &&
                <TouchableOpacity style={styles.readyButton} onPress={this.props.changeReadyState}>
                    <Text style={{ color: '#FFF', fontWeight: '500' }}>Vote to Start</Text>
                </TouchableOpacity>}
                <View style={styles.menuOptions}>
                    {this.props.game_started &&
                    <View style={styles.expandOptionsButton}>
                    <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(47), textAlign: 'center'  }} onPress={this.showOptions}>{this.props.chips}</Text>
                        <TouchableOpacity onPress={this.showOptions}>
                            <Text style={{ color: '#FFF', fontWeight: '500', width: normaliseWidth(275), textAlign: 'center' }}>
                                {this.state.show_options ? (<Entypo name="chevron-thin-down" size={32} color="black" />) : (<Entypo name="chevron-thin-up" size={32} color="black" />)}
                            </Text>
                        </TouchableOpacity>
                        <ModalHelp modalVisible={this.state.show_help} setModalVisible={this.showHelp} />
                        <Raise current_bet={this.props.current_bet} chips={this.props.chips} modalVisible={this.state.show_raise} setModalVisible={this.showRaise} />
                        <TouchableOpacity onPress={this.showHelp}>
                            <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(47), textAlign: 'center'  }}>
                                <MaterialCommunityIcons name="help-circle-outline" size={normaliseWidth(32)} color="black" />
                            </Text>
                        </TouchableOpacity>
                    </View>}
                    
                    {this.props.game_started &&
                    <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerCheck()}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>{this.props.largest_bet > (this.props.chips + this.props.current_bet) ? 'All in' : (this.props.largest_bet > this.props.current_bet ? 'Call' : 'Check')}</Text>
                    </TouchableOpacity>}
                    {this.props.game_started && <View>
                    <TouchableOpacity style={styles.optionsButton} onPress={this.showRaise}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Raise</Text>
                    </TouchableOpacity>
                    </View>
                    }
                    {this.props.game_started &&
                    <TouchableOpacity style={styles.optionsButton} onPress={() =>{this.playerFold()}}>
                        <Text style={{ color: '#FFF', fontWeight: '500' }}>Fold</Text>
                    </TouchableOpacity>}
                    <View style={{height: normaliseHeight(50)}} />
                </View>
            </View>
        )
    }
}
