import React, { PureComponent } from 'react'
import { Animated, View, Text } from 'react-native'
import { normaliseHeight, normaliseWidth } from '../styles/normalize';

export default class Notification extends PureComponent {
    constructor(props) {
        super(props)
        //console.log(props)

        this.state = {
          fadeAnimation: new Animated.Value(1),
          visible: true
        };
    }
    
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      }

    fadeOut = () => {
        let duration = (this.props.duration) ? this.props.duration : 1000
        Animated.timing(this.state.fadeAnimation, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true
        }).start()
      };

    componentDidMount() {
        this.delay(2000).then(() => this.fadeOut())
        this.state.fadeAnimation.addListener(({value}) => {if (value==0) this.setState({visible: false})})
    }

    //this.props.size
    render() {
        //let [width, height] = this.props.size
        if (this.props.notification) {
            let notification = this.props.notification
            return this.state.visible ? (
                <Animated.View style={[{marginHorizontal: normaliseWidth(10), marginVertical: normaliseHeight(5), paddingVertical: normaliseHeight(5), backgroundColor: '#E9446A', borderRadius: 10, zIndex: 3, justifyContent: 'center', alignItems: 'center', alignSelf: 'center'}, {opacity: this.state.fadeAnimation}]}>
                    <Text style={{color: '#fff', fontWeight: 'bold', marginHorizontal: normaliseWidth(10)}}>{notification}</Text>
                </Animated.View>
            ) : (<View></View>)
        } else {
            return (
                <></>
            )
        }
    }
}
