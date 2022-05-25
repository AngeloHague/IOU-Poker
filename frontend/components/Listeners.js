import { Vibration } from "react-native"

// INITIATE ALL LISTENERS USING SINGLE FUNCTION:
export function initListeners(component) {
    playerListener(component)
    //changeListener()
    tableListener(component)
    
    room.onMessage("startGame", (counter) => {
        //console.log('Starting game')
        component.setState({game_started: true})
    })
    
    room.onMessage("gameOver", (counter) => {
        //console.log('Starting game')
        component.setState({game_over: true})
    })

    // CHAT & NOTIFICATION LISTENER:
    room.onMessage("message", (message) => {
        //console.log('message received')
        //console.log(message)
        component.setState({ chat_messages: [...component.state.chat_messages, message] })
        if (message.isNotification == true) component.setState({ notifications: [...component.state.notifications, message.message] })
    })
}

// LOBBY LISTENER: Listens for joining and leaving players 
export function playerListener(component){
    global.room.state.players.onAdd = (player, key) => {

        // add your player entity to the game world!
        //console.log(player, " has been added at ", key)
        global.room.state.players.set(key, player)
        //this.updatePlayers(global.room.state.players) // render players in current state
        addPlayers(component, player) // render players in current state

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
                    // console.log(key, '\'s chips have changed from: ', change.previousValue, ' to ', change.value)
                    if (key === global.room.sessionId) {component.setState({chips: change.value})}
                    //player.chips = change.value
                    updatePlayers(component, global.room.state.players) // render players in current state
                    //renderPlayers(component.state, compon)
                } else if (change.field == 'current_bet') {
                    // console.log(key, '\'s current bet has changed from: ', change.previousValue, ' to ', change.value)
                    if (key === global.room.sessionId) component.setState({current_bet: player['current_bet']})
                    //player.chips = change.value
                    updatePlayers(component, global.room.state.players) // render players in current state
                    //renderPlayers(component.state, compon)
                }
            });
        };

        player.cards.onAdd = (card, idx) => {
            //player.cards.push(card)
            //console.log("Card  (", card.value, ") added for: ", key)
            //console.log(player.cards.length)
            // renderPlayerHand(component, global.room.state);
            if (key === global.room.sessionId) {
                //component.state.player_hand.push(card)
                component.setState({ player_hand: [...component.state.player_hand, card] })
                //console.log('Added to player hand. No. of cards in hand: ', component.state.player_hand.length)
            }
            
            card.onChange = (change) => {
                //console.log('Card cahnged: ', card, ' at: ', idx)
                if (card.revealed === true) {
                    //console.log('Card revealed: ', card.value)
                    let players = component.state.players
                    let player = players.get(key)
                    player.cards[idx] = card
                    players.set(key, player)
                component.setState({ players: players })}
            }
        }

        player.cards.onRemove = (card) => {
            //console.log("Card removed: ", card)
            component.setState(() => { 
                let empty = []
                return {player_hand: empty}
            });
        }

        // force "onChange" to be called immediatelly
        player.triggerAll();
    };
        
    global.room.state.players.onRemove = (player, key) => {
        //console.log(player, "has been removed at", key);
        global.room.state.players.delete(key)
        removePlayers(component, key) // render players in current state

        // remove your player entity from the game world!
    };
}

// COMMUNITY CARD LISTENERS
export function tableListener(component) {
    global.room.state.community_cards.onAdd = (card, key) => {
        //console.log('New community card dealt: ', card.value, ' at ', key)
        component.setState({ community_cards: [...component.state.community_cards, card] })

        card.onChange = (change, idx) => {
            let cards = component.state.community_cards
            cards[idx] = change.value
            component.setState({ community_cards: cards })
        }
    }
    global.room.state.community_cards.onRemove = (card) => {
        //console.log('Community card removed: ', card)
        component.setState(() => { 
            let empty = []
            return {community_cards: empty}
        });
    }
    global.room.state.listen('pot', (value, previous) => {
        component.setState({pot: value})
    })
    global.room.state.listen('current_player', (value, previous) => {
        //console.log('Current player is now: ', value)
        component.setState({current_player: value})
        if (global.room.sessionId === value) {
            // vibrate phone
            Vibration.vibrate()
        }
    })
}

// UPDATE THE LIST OF PLAYERS
export function updatePlayers(component, players) {
    //const _players = []
    const _players = component.state.players
    players.forEach((player) => {
        const _player = {
            name: player['name'],
            uid: player['uid'],
            sid: player['sessionId'],
            ready: player['ready'],
            chips: player['chips'],
            current_bet: player['current_bet'],
            folded: player['folded'],
            cards: player['cards'],
        }
        _players.set(_player.sid, _player)
    })
    component.setState({players: _players})
    //console.log('Updated Players: ', _players)
}

// ADD PLAYER
export function addPlayers(component, player) {
    //const _players = []
    const _players = component.state.players
    const _player = {
        name: player['name'],
        uid: player['uid'],
        sid: player['sessionId'],
        ready: player['ready'],
        chips: player['chips'],
        current_bet: player['current_bet'],
        folded: player['folded'],
        cards: player['cards'],
    }
    _players.set(_player.sid, _player)
    component.setState({players: _players})
    //console.log('Updated Players: ', _players)
}

// REMOVE PLAYERS
export function removePlayers(component, key) {
    const _players = component.state.players
    _players.delete(key)
    component.setState({players: _players})
    //console.log('Updated Players: ', _players)
}

// COMMUNICATE PLAYER ACTION WITH SERVER
export function playerAction(room, action, amount) {
    room.send("playerTurn", {action: action, amount: amount})
}