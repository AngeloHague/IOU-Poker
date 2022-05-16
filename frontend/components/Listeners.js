import {updatePlayers, renderPlayerHand, renderCommunityCards} from '../components/GameHelper'

// INITIATE ALL LISTENERS USING SINGLE FUNCTION:
export function initListeners(component) {
    playerListener(component)
    //changeListener()
    communityCardListener(component)
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
                }
            });
        };

        player.cards.onAdd = (card) => {
            //player.cards.push(card)
            console.log("Card added: ", card.value)
            //console.log(player.cards.length)
            renderPlayerHand(component, global.room.state);

            card.onChange = (change) => {
                // reveal changes
                // i.e. reveal cards at end of game
            }
        }

        player.cards.onRemove = (card) => {
            console.log("Card removed: ", card)
            renderPlayerHand(component, global.room.state);
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
export function communityCardListener(component){
    global.room.state.community_cards.onAdd = (card) => {
        //console.log('New community card dealt: ', card)
        global.room.state.community_cards.push(card)
        //console.log('New community cards: ', global.room.state.community_cards)

        card.onChange = (change, key) => {
            //console.log(change, ' card changed at ', key)
            //console.log('Cards: ', global.room.state.community_cards)
            renderCommunityCards(component, global.room.state);
            // animate changes
        }
    }
    global.room.state.community_cards.onRemove = (card) => {
        console.log('Community card removed: ', card)
    }
}

// LISTENS FOR STATE CHANGES
export function changeListener() {
    let chng_set = 0; // DEBUG PURPOSES
    let chng_idx = 0; // DEBUG PURPOSES
    room.state.onChange = (changes) => {
        console.log('Room State Changes #', chng_set)
        changes.forEach(change => {
            // console.log('Change #', chng_idx);
            // console.log(change.field);
            // console.log(change.value);
            // console.log(change.previousValue);
            changeRouter(change)
            chng_idx+=1 // DEBUG PURPOSES
        });
        //console.log('Room State Updated')
        //console.log(room.state)
        chng_set+=1 // DEBUG PURPOSES
    }
}



// ROUTES CHANGES TO RELEVANT FUNCTIONS
export function changeRouter(change) {
    switch(change.field) {
        case 'current_player':
            console.log('Current player changed from ', change.previousValue, ' to ', change.value)
            break;
        case 'community_cards':
            console.log('Community Cards changed from ', change.previousValue, ' to ', change.value)
            console.log(change)
            handleCommuninityCards(change)
            break;
        default:
            console.log('Other change occured')
            break;
    }
}

export function handleCommuninityCards(change) {
    console.log(change.previousValue.length)
    console.log(change.value.length)
    if (change.previousValue.length < change.value.length) {
        // cards have been dealt
        global.room.state.community_cards = change.value
        console.log('Cards have been dealt')
    } else {
        // 
    }
}

