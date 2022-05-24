 import React, { Component } from 'react'
 import { View, Text } from 'react-native'
 import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import { normaliseFont, normaliseHeight, normaliseWidth } from '../styles/normalize'
 
 export default class TurnTimer extends Component {
     constructor(props) {
        super(props)
        this.listener;

        this.state = {
            duration: 0,
            timer: (<></>),
            turn_idx: 0,
        }
     }
    
     componentDidMount() {
        this.listener = global.room.state.listen('turn_idx', (value, previous) => {
            if (value != previous) {
                //console.log('Turn index changed:')
                // this.setState({duration: 60})
                // this.setState({timer: this.state.timer(60)})
                this.setState({turn_idx: value})
            }
        })
     }

     timer = (turn_idx) => {
         return(
            <CountdownCircleTimer
            key={'turn_timer_'+turn_idx}
            size={normaliseHeight(45)}
            strokeWidth={normaliseHeight(5)}
            isPlaying
            duration={60}
            colors={'#E9446A'}
            colorsTime={[7, 5, 2, 0]}
        >
            {({ remainingTime }) => <Text style={{fontSize: normaliseFont(12), fontWeight: 'bold', color: '#fff'}}>{remainingTime}</Text>}
        </CountdownCircleTimer>
         )
     }

     componentWillUnmount() {
         this.listener()
     }
     render() {
         return (
             <View style={{paddingTop: normaliseHeight(10), flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                 {this.timer(this.state.turn_idx)}
             </View>
         )
     }
 }
 