import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, Context, type, filter } from "@colyseus/schema";
import { GameState, Player, Card, newDeck, readCard, shuffle, findBestHand, Hand, determineWinners } from "../schema/GameState";
import { Game } from "../Game";

// START GAME:
export function startGame(room: Room, state: GameState) {
  state.game_started = true
  //this.lock() // prevent new users joining
  state.connected_players = state.players.size
  //set all players' ready status
  state.players.forEach((player: Player, key: string) => {
    player.chips = state.chips
    player.ready = false
    state.players.set(key, player)
  })
  state.active_players = Array.from(state.players.keys())
  state.dealer_idx = 0
  startRound(room, state)
  room.broadcast("startGame")
  //room.broadcast("start_round")
}

// START ROUND:
export function startRound(room: Room, state: GameState) {
  let deck = newDeck()
  state.deck = shuffle(deck)
  dealCards(state)
  // reset variables
  state.largest_bet = 0
  state.pot = 0
  state.folded_players = 0
  state.matched_players = 0
  // assign dealer
  let no_players = state.active_players.length
  let d_idx = (state.dealer_idx) % no_players
  state.dealer = state.active_players[d_idx]
  // assign big blind player
  let bb_idx = (state.dealer_idx+1) % no_players
  state.bb_player = state.active_players[bb_idx]
  payBlind(state, state.bb_player, state.b_blind)
  // assign small blind player
  let sb_idx = (state.dealer_idx+2) % no_players
  state.sb_player = state.active_players[sb_idx]
  payBlind(state, state.sb_player, state.s_blind)
  // assign first player
  state.player_idx = bb_idx
  state.current_player = state.active_players[state.player_idx]
  announceWhoseTurn(room, state)
}

//   export function getPlayerName(clientID: string) {
//     let item = this.state.players.get(clientID)
//     return item.name
//   }

// PAY BLINDS:
export function payBlind(state: GameState, player_id: string, blind: number) {
  if (blind >= state.players.get(player_id).chips) {
    let amount = state.players.get(player_id).chips
    state.players.get(player_id).chips -= amount
    state.players.get(player_id).current_bet = amount
    if (state.largest_bet < amount){
      state.largest_bet = amount
    }
    state.pot += amount
  } else {
    state.players.get(player_id).chips -= blind
    state.players.get(player_id).current_bet = blind
    if (state.largest_bet < blind){
      state.largest_bet = blind
    }
    state.pot += blind
  }
}

// PLAYER (client) TURN CODE
export function playerTurn (room: Room, state: GameState, client: Client, turn: any) {
    // ensure its the correct players turn
  if(client.sessionId === state.current_player) {
      console.log(client.sessionId, ' is trying to ', turn.action, ' on their turn.')
    // player turn
    //console.log(client.sessionId, ' is trying to performing an action...')
    if (turn.action == 'fold') {
      // FOLD
      console.log(client.sessionId, " chose to fold")
      playerFold(room, state, client)
    } else if (turn.action == 'check') {
      console.log(client.sessionId, " chose to check")
      playerCheck(room, state, client)
    } else if (turn.action == 'bet') {
      console.log(client.sessionId, " chose to bet: ", turn.amount)
      //bet code
      playerBet(room, state, client, turn.amount)
    }
  } else {
      // not that player's turn
      console.log(client.sessionId, ' is trying to ', turn.action, ' on ', state.current_player, '\'s turn.')
  }
}

export function playerFold(room: Room, state: GameState, client: Client) {
  state.players.get(client.sessionId).folded = true
  state.folded_players+=1
  checkIfStageOver(room, state)
}

export function playerCheck(room: Room, state: GameState, client: Client) {
  if (state.players.get(client.sessionId).current_bet == state.largest_bet || state.players.get(client.sessionId).chips == 0) {
      console.log(client.sessionId, " checked successfully")
      state.matched_players += 1
      checkIfStageOver(room, state)
    } else {
      client.send('error', 'You cannot check! Please match the current bet')
      console.log(client.sessionId ,' cannot check! They must match the current bet')
    }
}

export function playerBet(room: Room, state: GameState, client: Client, amount: number) {
  if (amount < state.largest_bet && state.players.get(client.sessionId).chips >= state.largest_bet) {
  } else if (amount > state.largest_bet && state.players.get(client.sessionId).chips + state.players.get(client.sessionId).current_bet == amount) {
    //all in
    state.players.get(client.sessionId).current_bet = amount
    state.players.get(client.sessionId).chips -= amount
    state.largest_bet = amount
    state.pot += amount
    state.matched_players = 1
    console.log(client.sessionId, " has gone all-in with: ", amount)
    checkIfStageOver(room, state)
  } else if (amount > state.largest_bet && state.players.get(client.sessionId).chips + state.players.get(client.sessionId).current_bet > state.largest_bet) {
    // new maximum
    state.players.get(client.sessionId).current_bet = amount
    state.players.get(client.sessionId).chips -= amount
    state.largest_bet = amount
    state.pot += amount
    state.matched_players = 1
    console.log(client.sessionId, " has raised to: ", amount)
    checkIfStageOver(room, state)
  } else if (amount == state.largest_bet && state.players.get(client.sessionId).chips + state.players.get(client.sessionId).current_bet >= state.largest_bet) {
    // matched bet
    state.players.get(client.sessionId).current_bet = amount
    state.players.get(client.sessionId).chips -= amount
    state.pot += amount
    state.matched_players +=1
    console.log(client.sessionId, " has matched with: ", amount)
    checkIfStageOver(room, state)
  } else if (amount < state.largest_bet && state.players.get(client.sessionId).chips + state.players.get(client.sessionId).current_bet < state.largest_bet) {
    // split pot
    state.players.get(client.sessionId).current_bet = amount
    state.players.get(client.sessionId).chips -= amount
    state.pot += amount
    state.matched_players +=1
    console.log(client.sessionId, " has gone all-in with: ", amount)
    checkIfStageOver(room, state)
  }
}

export function nextPlayer(room: Room, state: GameState) {
  console.log('Determining next player...')
  state.player_idx+=1
  let idx = state.player_idx % state.active_players.length
  let key = state.active_players[idx]
  let next_player = state.players.get(key)
  if (next_player.folded || next_player.chips == 0) {
    console.log('Player not active, finding next player...')
    nextPlayer(room, state)
  } else {
    state.current_player = key
    console.log('Next player set: ', key)
  }
  announceWhoseTurn(room, state);
}

export function allocateWinnings(room: Room, state: GameState, winners: Hand[]) {
  winners.forEach((winner) => {
    try {
      if (state.pot > 0) {
        let max_payout = state.players.get(winner.owner).current_bet * state.betting_players.size
        if (max_payout >= state.pot) {
          console.log(winner.owner, ' has won ', state.pot,' chips')
          state.players.get(winner.owner).chips += state.pot
          state.pot = 0
        } else {
          if (max_payout < state.pot) {
            console.log(winner.owner, ' has won ', max_payout,' chips')
            state.players.get(winner.owner).chips += max_payout
            state.pot -= max_payout
          }
        }
      } else {
        throw ('Empty pot')
      }
    }
    catch (e) {
      console.log(e)
    }
    
  })
}

export function foldWin(room: Room, state: GameState) {
  console.log('Checking for fold victory')
  let winners: string[]
  let folded = 0
  let players = state.active_players
  players.forEach((key) => {
    let player = state.players.get(key)
    console.log('Checking if ', key, ' has folded')
    if (player.folded == true) {
      console.log(key, ' has folded.')
      folded+=1
    } else {
      winners.push(key)
    }
  });
  return winners
}

export function checkIfStageOver(room: Room, state: GameState) {
  if (state.active_players.length == state.folded_players-1) {
    // all other players folded
    let winners = foldWin(room, state)
    allocateWinnings(room, state, winners)
    console.log('All other players have folded. Winner is: ', winners[0])
  }
  else if (state.matched_players == state.active_players.length - state.folded_players) {
    console.log('Progressing to next stage:')
    // progress round to next stage
    if (state.round_stage == 0) {
      // reveal flop
      console.log('Revealing flop...')
      state.community_cards[0].revealed = true
      state.community_cards[1].revealed = true
      state.community_cards[2].revealed = true
    }
    else if (state.round_stage == 1) {
      // reveal turn
      console.log('Revealing turn...')
      state.community_cards[3].revealed = true
    }
    else if (state.round_stage == 2) {
      // reveal river
      console.log('Revealing river...')
      state.community_cards[4].revealed = true
    }
    else if (state.round_stage == 3) {
      // determine winner
      //determineWinner(room, state)
      let winners = determineWinners(state)
      //allocateWinnings(winners)
      // Reset after 5s
      let timeout = 5
      var timer = setInterval(function () {
        if (timeout <= 0) {
          clearInterval(timer)
          roundReset(room, state) // reset after 5s
        }
        console.log('Resetting round in: ', timeout)
        timeout--
      }, 1000);
      if (timeout <= 0) roundReset(room, state) // reset after 5s
    }
    state.matched_players = 0 // reset stage variables
    state.round_stage += 1
  } else {
    console.log('Stage not over')
  }
  nextPlayer(room, state)
}

export function determineWinner(room: Room, state: GameState) {
  // REDO FUNCTION !!
  let winners: string[];
  let winningHand = 0;
  console.log('Finding round winner')
  state.players.forEach((player: Player, key: string) => {
    //let besthand = findBestHand(state.community_cards, player.cards)
    let besthand = findBestHand(state.community_cards, player)
    if (besthand.rank > winningHand) {
      winningHand = besthand.rank
      winners = []
      winners.push(key)
    } else if (besthand.rank == winningHand) {
      winners.push(key)
    }
  });
  console.log('%s winning with %s', winners, winningHand)
  if (winners.length == 1) {
    return winners[0]
  } else if (winners.length > 1) {
    // determine who has best card and return 
  }
}

export function roundReset(room: Room, state: GameState) {
  console.log('Resetting round')
  state.dealer_idx+=1
  state.community_cards = new ArraySchema<Card>()
  state.round_stage = 0
  state.players.forEach((player) => {
    player.cards = new ArraySchema<Card>()
  });
  startRound(room, state)
}

export function getPlayerUID(state: GameState, clientID: string) {
  let item = state.players.get(clientID)
  return item.uid
}

export function announceWhoseTurn(room: Room, state: GameState) {
  console.log("Round Started - Current player: ", state.current_player)
  room.broadcast('whoseTurn', getPlayerUID(state, state.current_player))
}

export function dealCards(state: GameState) {
  let activePlayers: string[] = state.active_players
  //deal 2 cards to each player
  for (var i = 0; i < 2;  i++) {
    activePlayers.forEach((key) => {
      let card = state.deck.pop()
      card.owner = key
      //card.index = i
      console.log(key, '\'s card: ', card.value)
      state.players.get(key).cards.push(card)
    })
  }
  // deal 5 community cards
  for (var i = 0; i < 5; i++) {
    let card = state.deck.pop()
    //card.index = i
    state.community_cards.push(card)
    //console.log('Community Card #', (i+1), ':', card.value)
  }
  console.log('Community Cards:')
  state.community_cards.forEach(card => {
    console.log(card.value)
  });
}