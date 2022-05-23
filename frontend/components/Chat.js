import React, { Component, PureComponent } from 'react'
import { View, ScrollView, Text, TouchableOpacity, Modal, TextInput } from 'react-native'
import { styles } from '../styles/lobby';
import { normaliseFont, normaliseHeight, normaliseWidth } from '../styles/normalize';
import { MaterialCommunityIcons } from '@expo/vector-icons'

class Message extends PureComponent {
    constructor(props) {
        super(props)
        console.log(props)
    }

    render() {
        let message = this.props.message
        if (message) {
            return (message.isNotification) ? (
                <View style={{width: '100%'}}>
                    <Text style={{color: '#E9446A', fontWeight: 'bold', fontSize: normaliseFont(14)}}>{'Notification'}</Text>
                    <Text style={{marginLeft: normaliseWidth(10),fontWeight: 'bold',  fontSize: normaliseFont(14)}}>{this.props.message.message}</Text>
                </View>
            ) : (
                <View style={{width: '100%'}}>
                    <Text style={{color: '#E9446A', fontWeight: 'bold', fontSize: normaliseFont(14)}}>{this.props.message.sender}</Text>
                    <Text style={{marginLeft: normaliseWidth(10), fontSize: normaliseFont(12)}}>{this.props.message.message}</Text>
                </View>
            )
        }
        else return(<></>)
    }
}

export default class Chat extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            input: '',
        }
    }

    renderMessages(messages) {
        const components = []
        {[...messages].map(msg => {
            components.push(<Message key={'msg_' + msg.index} message={msg} />)
        })}
        return components
    }

    sendMessage() {
        let message = this.state.input
        global.room.send('message', message)
        this.setState({input: ''})
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
                    <View style={[styles.modalView, styles.modalChat]}>
                        <View style={{width: '100%', flex: 0, flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <View />
                        <TouchableOpacity onPress={this.props.setModalVisible} style={{width: normaliseWidth(47)}}>
                            <Text style={{ color: 'black', fontWeight: '500', width: normaliseWidth(47), textAlign: 'center'  }}>
                                <MaterialCommunityIcons name="close" size={normaliseWidth(26)} color="black" />
                            </Text>
                        </TouchableOpacity>
                        </View>
                        <Text style={styles.modalText}>Chat Window</Text>
                        <ScrollView style={{width: '100%'}}
                        ref={ref => this.scrollView = ref}
                        onContentSizeChange={(contentWidth, contentHeight)=>{        
                            this.scrollView.scrollToEnd({animated: true})
                        }}>
                            {this.renderMessages(this.props.messages)}
                        </ScrollView>
                        <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                            <TextInput
                                style={{width: normaliseWidth(220)}}
                                placeholder='Type a message here'
                                onChangeText={input => this.setState({ input })}
                                value={this.state.input}
                            />
                            <TouchableOpacity style={[styles.modalButton, {width: normaliseWidth(30), height: normaliseHeight(30), }]} onPress={() =>{this.sendMessage()}}>
                                <Text style={{ color: '#FFF', fontWeight: '500' }}><MaterialCommunityIcons name="send" size={20} color="white" /></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}
