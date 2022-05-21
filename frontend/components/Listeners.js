import {updatePlayers, renderPlayerHand, renderCommunityCards, renderPlayers} from '../components/GameHelper'

// INITIATE ALL LISTENERS USING SINGLE FUNCTION:
export function initListeners(component) {
    playerListener(component)
    //changeListener()
    tableListener(component)
    
    room.onMessage("startGame", (counter) => {
        console.log('Starting game')
        component.setState({game_started: true})
    })

    room.onMessage("whoseTurn", (player) => {
        console.log('Player turn: ', player)
    })
}

// LOBBY LISTENER: Listens for joining and leaving players 
export function playerListener(component){
    global.room.state.players.onAdd = (player, key) => {

        // add your player entity to the game world!
        //console.log(player, " has been added at ", key)
        global.room.state.players.set(key, player)
        //this.updatePlayers(global.room.state.players) // render players in current state
        updatePlayers(component, global.room.state.players) // render players in current state

        // If you want to track changes on a child object inside a map, this is a common pattern:
        player.onChange = (changes) => {
            changes.forEach(change => {
                if (change.field == 'ready') {
                    //console.log(key, '\'s ready state has changed: ', change.value)
                    let player = global.room.state.players.get(key)
                    player.ready = change.value
                    global.room.state.players.set(key, player)
                    //this.updatePlayers(global.room.state.players) // render players in current state
                    updatePlayers(component, global.room.state.players) // render players in current state
                } else if (change.field == 'chips') {
                    console.log(key, '\'s chips have changed from: ', change.previousValue, ' to ', change.value)
                    if (key === global.room.sessionId) {component.setState({chips: change.value})}
                    //player.chips = change.value
                    updatePlayers(component, global.room.state.players) // render players in current state
                    //renderPlayers(component.state, compon)
                } else if (change.field == 'current_bet') {
                    console.log(key, '\'s chips have changed from: ', change.previousValue, ' to ', change.value)
                    if (key === global.room.sessionId) component.setState({current_bet: player['current_bet']})
                    //player.chips = change.value
                    updatePlayers(component, global.room.state.players) // render players in current state
                    //renderPlayers(component.state, compon)
                }
            });
        };

        player.cards.onAdd = (card, idx) => {
            //player.cards.push(card)
            console.log("Card  (", card.value, ") added for: ", key)
            //console.log(player.cards.length)
            // renderPlayerHand(component, global.room.state);
            if (key === global.room.sessionId) {
                //component.state.player_hand.push(card)
                component.setState({ player_hand: [...component.state.player_hand, card] })
                console.log('Added to player hand. No. of cards in hand: ', component.state.player_hand.length)
            }
            
            card.onChange = (change) => {
                //console.log('Card cahnged: ', card, ' at: ', idx)
                if (card.revealed === true) {
                    console.log('Card revealed: ', card.value)
                    let players = component.state.players
                    let player = players.get(key)
                    player.cards[idx] = card
                    players.set(key, player)
                component.setState({ players: players })}
            }
        }

        player.cards.onRemove = (card) => {
            console.log("Card removed: ", card)
            component.setState(() => { 
                let empty = []
                return {player_hand: empty}
            });
        }

        // force "onChange" to be called immediatelly
        player.triggerAll();
        
        room.state.players.onRemove = (player, key) => {
            console.log(player, "has been removed at", key);
            global.room.state.players.delete(key)
            updatePlayers(global.room.state.players) // render players in current state

            // remove your player entity from the game world!
        };
    };
}

// COMMUNITY CARD LISTENERS
export function tableListener(component){
    global.room.state.community_cards.onAdd = (card, key) => {
        console.log('New community card dealt: ', card.value, ' at ', key)
        component.setState({ community_cards: [...component.state.community_cards, card] })

        card.onChange = (change, idx) => {
            let cards = component.state.community_cards
            cards[idx] = change.value
            component.setState({ community_cards: cards })
        }
    }
    global.room.state.community_cards.onRemove = (card) => {
        console.log('Community card removed: ', card)
        component.setState(() => { 
            let empty = []
            return {community_cards: empty}
        });
    }
    global.room.state.listen('pot', (value, previous) => {
        component.setState({pot: value})
    })
    global.room.state.listen('current_player', (value, previous) => {
        console.log('Current player is now: ', value)
        component.setState({current_player: value})
    })
}

// // LISTENS FOR STATE CHANGES
// export function changeListener() {
//     let chng_set = 0; // DEBUG PURPOSES
//     let chng_idx = 0; // DEBUG PURPOSES
//     room.state.onChange = (changes) => {
//         console.log('Room State Changes #', chng_set)
//         changes.forEach(change => {
//             // console.log('Change #', chng_idx);
//             // console.log(change.field);
//             // console.log(change.value);
//             // console.log(change.previousValue);
//             changeRouter(change)
//             chng_idx+=1 // DEBUG PURPOSES
//         });
//         //console.log('Room State Updated')
//         //console.log(room.state)
//         chng_set+=1 // DEBUG PURPOSES
//     }
// }



// // ROUTES CHANGES TO RELEVANT FUNCTIONS
// export function changeRouter(change) {
//     switch(change.field) {
//         case 'current_player':
//             console.log('Current player changed from ', change.previousValue, ' to ', change.value)
//             break;
//         case 'community_cards':
//             console.log('Community Cards changed from ', change.previousValue, ' to ', change.value)
//             console.log(change)
//             handleCommuninityCards(change)
//             break;
//         default:
//             console.log('Other change occured')
//             break;
//     }
// }

// export function handleCommuninityCards(change) {
//     console.log(change.previousValue.length)
//     console.log(change.value.length)
//     if (change.previousValue.length < change.value.length) {
//         // cards have been dealt
//         global.room.state.community_cards = change.value
//         console.log('Cards have been dealt')
//     } else {
//         // 
//     }
// }

