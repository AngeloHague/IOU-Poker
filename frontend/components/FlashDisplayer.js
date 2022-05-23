import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import { normaliseHeight } from '../styles/normalize'
import Notification from './Notification'

export default class FlashDisplayer extends PureComponent {
    constructor(props) {
        super(props)
    }
    
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      }

    renderNotification(notifications) {
        const components = []
        let idx = 0
        {[...notifications].map(notif=> {
            let duration = 500
            components.push(<Notification key={'notification_'+idx} notification={notif} duration={duration} />)
            idx+=1
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
