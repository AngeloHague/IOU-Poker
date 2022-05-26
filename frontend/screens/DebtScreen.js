import React, { Component } from 'react'
import { Text, View, TouchableOpacity, KeyboardAvoidingView, Image, ScrollView, Alert } from 'react-native'
import common from '../styles/common'
import Background from '../assets/background.svg'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { normaliseFont, normaliseHeight, normaliseWidth } from '../styles/normalize'
import { auth, db } from '../firebase';

class Debt extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '[USER]',
            amount: '[X]',
            stake: '[Y]',
            approvedBySender: false,
            approvedByRecipient: false,
            completed: false,
        }
    }

    componentDidMount() {
        if (this.props.document.data()) {
            let data = this.props.document.data()
            let name = this.props.outgoing ? data.recipientName : data.senderName
            this.setState({name: name, amount: data.amount, stake: data.stake, approvedBySender: data.approved_by_sender, approvedByRecipient: data.approved_by_recipient, completed: data.completed})
        }
    }

    markAsComplete(outgoing) {
        let ref = db.collection('debts').doc(this.props.id)
        if (outgoing) {
            if (this.isMarkedAsCompleteByUser(!outgoing))
            ref.update({
                approved_by_sender: true,
                completed: true,
            }).then((promise) => {
                console.log('Updated. ', promise)
                this.setState({approvedBySender: true, completed: true})
            })
            else ref.update({
                approved_by_sender: true,
            }).then((promise) => {
                console.log('Updated. ', promise)
                this.setState({approvedBySender: true})
            })
        } else {
            if (this.isMarkedAsCompleteByUser(!outgoing))
            ref.update({
                approved_by_recipient: true,
                completed: true,
            }).then((promise) => {
                console.log('Updated. ', promise)
                this.setState({approvedByRecipient: true, completed: true})
            })
            else ref.update({
                approved_by_recipient: true,
            }).then((promise) => {
                console.log('Updated. ', promise)
                this.setState({approvedByRecipient: true})
            })
        }
    }

    isMarkedAsCompleteByUser(outgoing) {
        return (outgoing) ? this.state.approvedBySender : this.state.approvedByRecipient
    }

    completeAlert = () => {
        if (!this.state.complete)
        Alert.alert(
        "Mark as Complete?",
        "This will be moved to your Settled Debts when both players have marked it as complete.",
        [
            {
            text: "No",
            onPress: () => {},
            //onPress: () => console.log("Cancel Pressed"),
            style: "Cancel"
            },
            { text: "Yes", onPress: () => {this.markAsComplete(this.props.outgoing)} }
        ])
    }

    render() {
        return (
            <TouchableOpacity style={{marginHorizontal: normaliseWidth(10), marginVertical: normaliseHeight(10)}} onPress={this.completeAlert} >
                <View style={{ width: 'auto', paddingHorizontal: normaliseWidth(15), paddingVertical: normaliseHeight(10), borderRadius: 10, backgroundColor: '#fff'}}>
                <View style={{paddingBottom: normaliseHeight(5)}}>
                    {this.props.outgoing ?
                        <Text style={{fontSize: normaliseFont(16)}}>You owe {this.state.name}: {this.state.amount} {this.state.stake}</Text>
                    :
                        <Text style={{fontSize: normaliseFont(16)}}>{this.state.name} owes you: {this.state.amount} {this.state.stake}</Text>
                    }
                </View>
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, }}>
                    <Text style={{fontSize: normaliseFont(12), color: this.isMarkedAsCompleteByUser(this.props.outgoing) ? '#06a800' : 'red'}}>{this.isMarkedAsCompleteByUser(this.props.outgoing) ? 'You have confirmed this debt.' : 'Confirm this debt?'}</Text>
                    <Text style={{fontSize: normaliseFont(12), color: this.isMarkedAsCompleteByUser(!this.props.outgoing) ? '#06a800' : 'red'}}>{this.isMarkedAsCompleteByUser(!this.props.outgoing) ? 'They have confirmed this debt.' : 'Awaiting confirmation.'}</Text>
                </View>
            </View>
            </TouchableOpacity>
        )
    }
}

export default class DebtScreen extends Component {
    static navigationOptions = {
        headerShown: false
    }

    constructor(props) {
        super(props)
        this.state = {
            show_outgoing_screen: true,
            show_incoming_screen: false,
            show_settled_screen: false,
            loading: false,
            outgoing: new Map(),
            incoming: new Map(),
            settled: new Map(),
        }
    }

    showOutgoing = () => {
        this.setState({show_outgoing_screen: true, show_incoming_screen: false, show_settled_screen: false})
    }

    showIncoming = () => {
        this.setState({show_outgoing_screen: false, show_incoming_screen: true, show_settled_screen: false})
    }

    showSettled = () => {
        this.setState({show_outgoing_screen: false, show_incoming_screen: false, show_settled_screen: true})
    }

    renderDebts(debts) {
        const components = []
        {[...debts.values()].map(debt=> {
            let [doc, out] = debt
            components.push(<Debt key={doc.id} id={doc.id} document={doc} outgoing={out} />)
        })}
        return components
    }

    async fetchData() {
        let outgoing = new Map()
        let incoming = new Map()
        let settled = new Map()

        await db.collection("debts").where("sender", "==", auth.currentUser.uid)
        .get()
        .then((querySnapshot) => {
            console.log('loading outgoing debts') // debug purposes
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.data())
                if (doc.data().completed == true || (doc.data().approved_by_recipient && doc.data().approved_by_sender)) {
                    settled.set(doc.id, [doc, true])
                } else outgoing.set(doc.id, [doc, true])
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

        await db.collection("debts").where("recipient", "==", auth.currentUser.uid)
        .get()
        .then((querySnapshot) => {
            console.log('loading incoming debts') // debug purposes
            querySnapshot.forEach((doc) => {
                // console.log(doc.data())
                // doc.data() is never undefined for query doc snapshots
                if (doc.data().completed == true || (doc.data().approved_by_recipient && doc.data().approved_by_sender)) {
                    settled.set(doc.id, [doc, false])
                } else incoming.set(doc.id, [doc, false])
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

        this.setState({outgoing: outgoing, incoming: incoming, settled: settled})
        console.log('Done loading')
    }
    
    async componentDidMount() {
        this.fetchData()
    }

    render() {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"} style={[common.container, {justifyContent: 'flex-end'}]}>
                <Background position='absolute' style={{top: 0, left: 0}} preserveAspectRatio="xMinYMin slice"/>
                <View style={common.navBar}>
                    <TouchableOpacity style={common.navButton} onPress={() => this.props.navigation.goBack()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}><MaterialCommunityIcons name="keyboard-backspace" size={normaliseFont(40)} color="white" /></Text></TouchableOpacity>
                    <Image style={common.navLogo} source={require('../assets/NavLogo.png')} />
                    <TouchableOpacity style={common.navButton} disabled={true}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}></Text></TouchableOpacity>
                </View>
                <View style={{ height: normaliseHeight(50), justifyContent:'center' }}>
                    <Text style={{fontSize: normaliseFont(24), alignSelf:'center', fontFamily: 'Roboto_500Medium', fontWeight: '500', color: '#fff'}}>{this.state.show_outgoing_screen ? 'Outgoing Debts' : (this.state.show_incoming_screen ? 'Incoming Debts' : 'Settled Debts')}</Text>
                </View>

                <ScrollView style={{ flex: 1, flexGrow: 1 }}>
                    {this.state.show_outgoing_screen && this.renderDebts(this.state.outgoing)}
                    {this.state.show_incoming_screen && this.renderDebts(this.state.incoming)}
                    {this.state.show_settled_screen && this.renderDebts(this.state.settled)}
                </ScrollView>

                <View style={{position: 'relative', flex: 0, flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: normaliseHeight(15)}}>
                    {/* footer */}
                    <TouchableOpacity style={[common.debtButton, {backgroundColor: (this.state.show_outgoing_screen ? '#E9446A' : 'transparent')}]} onPress={() => this.showOutgoing()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}><MaterialCommunityIcons name="upload" size={normaliseFont(45)} color='#fff' /></Text></TouchableOpacity>
                    <TouchableOpacity style={[common.debtButton, {backgroundColor: (this.state.show_incoming_screen ? '#E9446A' : 'transparent')}]} onPress={() => this.showIncoming()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}><MaterialCommunityIcons name="download" size={normaliseFont(45)} color='#fff' /></Text></TouchableOpacity>
                    <TouchableOpacity style={[common.debtButton, {backgroundColor: (this.state.show_settled_screen ? '#E9446A' : 'transparent')}]} onPress={() => this.showSettled()}><Text style={{ color: '#FFF', fontWeight: '500',  textAlign: 'center'}}><MaterialCommunityIcons name="checkbox-marked" size={normaliseFont(45)} color='#fff' /></Text></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        )
    }
}
