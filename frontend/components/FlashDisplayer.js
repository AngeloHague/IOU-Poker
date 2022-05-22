import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import { normaliseHeight } from '../styles/normalize'
import Notification from './Notification'

export default class FlashDisplayer extends PureComponent {
    constructor(props) {
        super(props)
        console.log(props)
        this.state = {
            html: (<></>)
        }
    }
    
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      }

    renderNotification(notifications) {
        function removeNotifcation() {
            this.setState({ cards: this.state.cards.slice(1) })
        }
        const components = []
        {[...notifications].map(notif => {
            let duration = 500
            components.push(<Notification notification={notif} duration={duration} />)
        })}
        return components
    }

    render() {
        if (this.props.notifications) {
            //let notification = notifications[notifications.length-1]
            return (
                <View style={{width: '100%', height: normaliseHeight(50)}}>
                    {this.renderNotification(this.props.notifications)}
                </View>
            )
        } else {
            return (
                <View style={{width: '100%', height: normaliseHeight(50)}}>
                    <Text></Text>
                </View>
            )
        }
    }
}
