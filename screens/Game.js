import React, { Component } from 'react'
import { Text, View } from 'react-native'

export default class Game extends Component {

    state = {
        stage: 0,           //Stage of the game
        players: [],        //Array of players
        buy_in: [],         //Buy-in info
        startingStack: 0,   //Starting no. of chips per player
        round: 0,           //Round number
        total_bet: 0,       //Total stack of player bets 
        dealer: '',         //Dealer's player id
        starting_player: '',//Starting player's turn
        current_player: 0,  //Current player's turn (position in players[] array)
        playersRemaining: 0,//No. of player's who are still in the game
        playersMatching: 0, //No. of player's matching the current bet
        playersFolded: 0,   //No. of players who have folders
        communityCards: [], //Community Cards
    }

    examplePlayer = {
        player_id: '',
        player_name: '',
        stacks: 0,
        hand: [],
        isFold: false,
        isAllIn: false,
        player_bet: 0,
    }

    performStage() {
        switch (this.stage) {
            case 0:
                //New Game: Inititate Setup
                break;
            case 1:
                //Deal Cards
                break;
            case 2:
                //Place Bets
                break;
            case 3:
                //Reveal The Flop
                break;
            case 4:
                //Reveal The Turn
                break;
            case 5:
                //Reveal The River
                break;
            case 6:
                //Display Winner
                break;
        }
    }

    setBlinds() {}

    dealToPlayers() {}

    render() {
        return (
            <View>
                <Text> textInComponent </Text>
            </View>
        )
    }
}
