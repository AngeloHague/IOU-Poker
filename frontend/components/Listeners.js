import { Vibration } from "react-native"

// INITIATE ALL LISTENERS USING SINGLE FUNCTION:
export function initListeners(component) {
    playerListener(component)
    tableListener(component)
    
    room.onMessage("startGame", (counter) => {
        component.setState({game_started: true})
    })
    
    room.onMessage("gameOver", (counter) => {
        component.setState({game_over: true})
    })

    // CHAT & NOTIFICATION LISTENER:
    room.onMessage("message", (message) => {
        component.setState({ chat_messages: [...component.state.chat_messages, message] })
        if (message.isNotification == true) component.setState({ notifications: [...component.state.notifications, message.message] })
    })
}

// PLAYER LISTENER: Listens for joining and leaving players, as well as any changes
export function playerListener(component){
    global.room.state.players.onAdd = (player, key) => {
        global.room.state.players.set(key, player)
        addPlayers(component, player) // render players in current state

        player.onChange = (changes) => {
            changes.forEach(change => {
                if (change.field == 'ready') {
                    let player = global.room.state.players.get(key)
                    player.ready = change.value
                    global.room.state.players.set(key, player)
                    updatePlayers(component, global.room.state.players) // render players in current state
                } else if (change.field == 'chips') {
                    if (key === global.room.sessionId) {component.setState({chips: change.value})}
                    updatePlayers(component, global.room.state.players) // render players in current state
                } else if (change.field == 'current_bet') {
                    if (key === global.room.sessionId) component.setState({current_bet: player['current_bet']})
                    updatePlayers(component, global.room.state.players) // render players in current state
                }
            });
        };

        player.cards.onAdd = (card, idx) => {
            if (key === global.room.sessionId) {
                component.setState({ player_hand: [...component.state.player_hand, card] })
            }
            
            card.onChange = (change) => {
                if (card.revealed === true) {
                    let players = component.state.players
                    let player = players.get(key)
                    player.cards[idx] = card
                    players.set(key, player)
                component.setState({ players: players })}
            }
        }

        player.cards.onRemove = (card) => {
            component.setState(() => { 
                let empty = []
                return {player_hand: empty}
            });
        }

        // force "onChange" to be called immediatelly
        player.triggerAll();
    };
        
    global.room.state.players.onRemove = (player, key) => {
        global.room.state.players.delete(key)
        removePlayers(component, key) // render players in current state
    };
}

// COMMUNITY CARD LISTENERS
export function tableListener(component) {
    global.room.state.community_cards.onAdd = (card, key) => {
        component.setState({ community_cards: [...component.state.community_cards, card] })

        card.onChange = (change, idx) => {
            let cards = component.state.community_cards
            cards[idx] = change.value
            component.setState({ community_cards: cards })
        }
    }
    global.room.state.community_cards.onRemove = (card) => {
        component.setState(() => { 
            let empty = []
            return {community_cards: empty}
        });
    }
    global.room.state.listen('pot', (value, previous) => {
        component.setState({pot: value})
    })
    global.room.state.listen('current_player', (value, previous) => {
        component.setState({current_player: value})
        if (global.room.sessionId === value) {
            // vibrate phone
            Vibration.vibrate()
        }
    })
}

// UPDATE THE LIST OF PLAYERS
export function updatePlayers(component, players) {
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
}

// ADD PLAYER
export function addPlayers(component, player) {
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
}

// REMOVE PLAYERS
export function removePlayers(component, key) {
    const _players = component.state.players
    _players.delete(key)
    component.setState({players: _players})
}

// COMMUNICATE PLAYER ACTION WITH SERVER
export function playerAction(room, action, amount) {
    room.send("playerTurn", {action: action, amount: amount})
}