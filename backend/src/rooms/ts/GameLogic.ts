import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, Context, type, filter } from "@colyseus/schema";
import { GameState, Player, Card, newDeck, readCard, shuffle, findBestHand, Hand, determineWinners } from "../schema/GameState";
import { Game } from "../Game";
import { HAND_NAME_MAP } from "../schema/constants";

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
  let deck = newDeck()
  state.deck = shuffle(deck)
  dealCards(state)
  // reset variables
  state.largest_bet = 0
  state.pot = 0
  state.folded_players = 0
  state.matched_players = 0
  // set accumulative variables for index assignment
  state.dealer_idx = 0 // room creator is first dealer
  state.big_blind_idx = state.dealer_idx+1
  state.small_blind_idx = state.big_blind_idx+1
  // assign dealer
  let no_players = state.active_players.length
  let d_idx = (state.dealer_idx) % no_players
  state.dealer = state.active_players[d_idx]
  // // assign big blind player
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
  //startRound(room, state)
  room.broadcast("startGame")
  announceWhoseTurn(room, state)
  //room.broadcast("start_round")
}

async function incrementIndex(state: GameState, variable: any) {
  variable+=1
  let idx = variable % state.active_players.length
  if (state.players.get(state.active_players[idx]).isOut) {
    incrementIndex(state, variable)
  } else return idx
}

// NEXT ROUND:
function nextRound(room: Room, state: GameState) {
  let deck = newDeck()
  state.deck = shuffle(deck)
  dealCards(state)
  // assign dealer
  incrementIndex(state, state.dealer_idx).then((d_idx) => {
    state.dealer = state.active_players[d_idx]
    console.log(state.dealer, ' is now the dealer.')
    // assign big blind player
    state.big_blind_idx = state.dealer_idx+1
    let bb_idx = incrementIndex(state, state.big_blind_idx).then((bb_idx) => {
      state.bb_player = state.active_players[bb_idx]
      console.log(state.bb_player, ' is now the big blind.')
      // assign small blind player
      state.small_blind_idx = state.big_blind_idx+1
      let sb_idx = incrementIndex(state, state.small_blind_idx).then((sb_idx) => {
        state.sb_player = state.active_players[sb_idx]
        console.log(state.sb_player, ' is now the small blind.')
        payBlind(state, state.bb_player, state.b_blind)
        payBlind(state, state.sb_player, state.s_blind)
        // assign first player
        state.player_idx = bb_idx
        state.current_player = state.active_players[state.player_idx]
        // start round
        announceWhoseTurn(room, state)
      });
    });
  });
}

// NEXT ROUND:
// export function nextRound(room: Room, state: GameState) {
//   let deck = newDeck()
//   state.deck = shuffle(deck)
//   dealCards(state)
//   // reset variables
//   state.largest_bet = 0
//   state.pot = 0
//   state.folded_players = 0
//   state.matched_players = 0
//   prepareNextRound(room, state)
//   // assign dealer
//   // let no_players = state.active_players.length
//   // let d_idx = (state.dealer_idx) % no_players
//   // state.dealer = state.active_players[d_idx]
//   // // assign big blind player
//   // let bb_idx = (state.dealer_idx+1) % no_players
//   // state.bb_player = state.active_players[bb_idx]
//   payBlind(state, state.bb_player, state.b_blind)
//   // assign small blind player
//   // let sb_idx = (state.dealer_idx+2) % no_players
//   // state.sb_player = state.active_players[sb_idx]
//   payBlind(state, state.sb_player, state.s_blind)
//   // assign first player
//   // state.player_idx = bb_idx
//   state.current_player = state.active_players[state.player_idx]
//   announceWhoseTurn(room, state)
// }

//   export function getPlayerName(clientID: string) {
//     let item = this.state.players.get(clientID)
//     return item.name
//   }

// PAY BLINDS:
function payBlind(state: GameState, player_id: string, blind: number) {
  if (blind >= state.players.get(player_id).chips) {
    let amount = state.players.get(player_id).chips
    state.players.get(player_id).chips -= amount
    state.players.get(player_id).current_bet = amount
    if (state.largest_bet < amount){
      state.largest_bet = amount
      //state.matched_players = 1
    }
    state.pot += amount
  } else {
    state.players.get(player_id).chips -= blind
    state.players.get(player_id).current_bet = blind
    if (state.largest_bet < blind){
      state.largest_bet = blind
      //state.matched_players = 1
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
      playerFold(room, state, state.players.get(client.sessionId))
    } else if (turn.action == 'check') {
      console.log(client.sessionId, " chose to check")
      playerCheck(room, state, state.players.get(client.sessionId))
    // } else if (turn.action == 'bet') {
    //   console.log(client.sessionId, " chose to bet: ", turn.amount)
    //   //bet code
    //   playerBet(room, state, client, turn.amount)
    // }
    } else if (turn.action == 'raise') {
      console.log(client.sessionId, " chose to raise: ", turn.amount)
      //bet code
      playerRaise(room, state, state.players.get(client.sessionId), turn.amount)
    }
  } else {
      // not that player's turn
      console.log(client.sessionId, ' is trying to ', turn.action, ' on ', state.current_player, '\'s turn.')
  }
}

function playerFold(room: Room, state: GameState, player: Player) {
  player.isFolded = true
  state.folded_players+=1
  checkIfStageOver(room, state)
}

// function playerFold(room: Room, state: GameState, client: Client) {
//   state.players.get(client.sessionId).isFolded = true
//   state.folded_players+=1
//   checkIfStageOver(room, state)
// }

function playerCheck(room: Room, state: GameState, player: Player) {
  if (player.current_bet == state.largest_bet || player.chips == 0) {
      console.log(player.sessionId, " checked successfully", '. Total Pot: ', state.pot)
      state.matched_players += 1
      checkIfStageOver(room, state)
    } else {
      if (player.chips > state.largest_bet) {
        // Call bet
        playerCall(room, state, player)
      } else if (player.chips <= state.largest_bet) {
        // All in
        playerAllIn(room, state, player)
      }
    }
}

function playerCall(room: Room, state: GameState, player: Player) {
  let increase = state.largest_bet - player.current_bet
  player.current_bet += increase
  player.chips -= increase
  state.matched_players+=1
  state.pot += increase
  console.log(player.sessionId, ' called, adding ', increase, '. Total Pot: ', state.pot)
  checkIfStageOver(room, state)
}

function playerAllIn(room: Room, state: GameState, player: Player) {
  let amount = player.chips
  player.current_bet += amount
  player.chips -= amount
  player.isAllIn = true
  if (player.current_bet > state.largest_bet) {
    state.largest_bet = player.current_bet
    state.matched_players = 1
  } else state.matched_players+=1
  state.all_in_players += 1
  state.pot += amount
  console.log(player.sessionId, ' went all-in with: ', amount, '. Total Pot: ', state.pot)
  checkIfStageOver(room, state)
}

function playerRaise(room: Room, state: GameState, player: Player, amount: number) {
  if (amount == player.chips && player.current_bet + amount > state.largest_bet) {
    playerAllIn(room, state, player)
  } else if (player.current_bet + amount > state.largest_bet) {
    if (amount <= player.chips) {
      player.current_bet += amount
      state.largest_bet = amount
      state.pot += amount
      state.matched_players = 1
      console.log(player.sessionId, ' raised by: ', amount, '. Total Pot: ', state.pot)
      checkIfStageOver(room, state)
    } else {
      // player cannot afford
    }
  }
  else {
    // amount not big enough
  }
}

function nextPlayer(room: Room, state: GameState) {
  console.log('Determining next player...')
  console.log('%s players total: %s are folded, %s are all-in',state.active_players.length, state.folded_players, state.all_in_players)
  state.player_idx+=1
  let idx = state.player_idx % state.active_players.length
  let key = state.active_players[idx]
  let next_player = state.players.get(key)
  if (next_player.isFolded || next_player.chips == 0) {
    console.log('Player not active, finding next player...')
    nextPlayer(room, state)
  } else {
    state.current_player = key
    console.log('Next player set: ', key)
  }
  announceWhoseTurn(room, state);
}

function revealHands(state: GameState) {
  state.players.forEach(player => {
    player.cards.forEach(card => card.revealed = true)
  });
}

function allocateWinnings(room: Room, state: GameState, winners: any[]) {
  winners.forEach((winning_hands) => {
    try {
      if (state.pot > 0) {
        if (winning_hands.length > 1) {
          // multiple winners
          payOutSplitPot(state, winners);
        } else if (winning_hands.length == 1) {
          // one winner
          payOut(state, winning_hands[0], checkMaxPayout(state, state.players.get(winning_hands[0].owner)));
        }
        
      } else {
        throw ('Empty pot')
      }
    }
    catch (e) {
      //console.log(e)
    }
    
  });
  // In the event of a split pot leaving chips, give to first winner:
  // e.g. 2 players bet 300, while the 3rd (small blind) entered only bet 25:
  // 625 / 2 = 312.5. As operations are integer-based, 1 chips will be left in the pot.
  if (state.pot > 0) {
    payOut(state, winners[0][0], checkMaxPayout(state, state.players.get(winners[0][0].owner)));
  }
}

//payOut
//payOutSplitPot
//checkMaxPayout

// Checks the maximum payout this player can earn (i.e. split pots can earn less than others)
function checkMaxPayout(state: GameState, winner: Player) {
  let max_payout: number = 0
  state.players.forEach(player => {
    if (player.current_bet <= winner.current_bet) max_payout+=player.current_bet
    else max_payout+=winner.current_bet
  });
  return max_payout
}

// Checks for side pots and splits according to their possible earnings
function splitSidePots(state: GameState, pots: any[]) {
  let split_pot = Math.floor(state.pot / pots.length)
  let remaining_pots: any = []

  pots.forEach(pot => {
    let max_split = Math.floor(pot.pot / pots.length)
    if (max_split <= split_pot) {
      // payout
      payOut(state, pot.winner, max_split)
    } else remaining_pots.push(pot)
  });
  if (remaining_pots == pots.length) {
    return remaining_pots
  } else splitSidePots(state, remaining_pots)
};

function payOutSplitPot(state: GameState, winners: Hand[]) {
  let pots: any = []
  winners.forEach(winner => {
    let max_payout = checkMaxPayout(state, state.players.get(winner.owner))
    pots.push({pot: max_payout, winner: winner})
  })
  // Sort Ascending
  pots.sort((a: any, b:any) => {
    return a.pot - b.pot
  });
  let remaining_pots = splitSidePots(state, pots)
  if (remaining_pots.length > 0) {
    let split_pot = Math.floor(state.pot / remaining_pots.length)
    remaining_pots.forEach((pot: any) => {
      payOut(state, pot.winner, split_pot)
    });
  }
}

function payOut(state: GameState, winning_hand: Hand, max_payout: number) {
  let winner = state.players.get(winning_hand.owner)
  if (max_payout >= state.pot) {
    // Full Payout
    console.log(winner.sessionId, ' has won ', state.pot,' chips with a ', HAND_NAME_MAP.get(winning_hand.rank))
    winner.chips += state.pot
    state.pot = 0
  } else {
    // Partial Payout (Side Pots)
    if (max_payout < state.pot) {
      console.log(winner.sessionId, ' has won ', max_payout,' chips with a ', HAND_NAME_MAP.get(winning_hand.rank))
      winner.chips += max_payout
      state.pot -= max_payout
    }
  }
}


export function foldWin(room: Room, state: GameState) {
  console.log('Checking for fold victory')
  let winners: string[]
  let folded = 0
  let players = state.active_players
  players.forEach((key) => {
    console.log('Checking if ', key, ' has folded')
    if (state.players.get(key).isFolded == true) {
      console.log(key, ' has folded.')
      folded+=1
    } else {
      winners.push(key)
    }
  });
  return winners
}

function revealCommunityCards(amount: string, state: GameState) {
  switch(amount) {
    case('flop'):
      state.community_cards[0].revealed = true
      state.community_cards[1].revealed = true
      state.community_cards[2].revealed = true
      break;
    case('turn'):
      state.community_cards[3].revealed = true
      break;
    case('river'):
      state.community_cards[4].revealed = true
      break;
    case('all'):
      state.community_cards[0].revealed = true
      state.community_cards[1].revealed = true
      state.community_cards[2].revealed = true
      state.community_cards[3].revealed = true
      state.community_cards[4].revealed = true
      break;
  }
}

export function checkIfStageOver(room: Room, state: GameState) {
  // if everyone else has folded, last player remaining wins:
  if (state.active_players.length == state.folded_players-1) {
    // all other players folded
    let winners = foldWin(room, state)
    allocateWinnings(room, state, winners)
    console.log('All other players have folded. Winner is: ', winners[0])
  } else if (state.all_in_players == state.active_players.length) {
    // all players are all in
    // reveal remaining cards
    if (state.round_stage == 0) {
      state.community_cards[0].revealed = true
      state.community_cards[1].revealed = true
      state.community_cards[2].revealed = true
      state.community_cards[3].revealed = true
      state.community_cards[4].revealed = true
    }
    else if (state.round_stage == 1) {
      // reveal turn
      console.log('Revealing turn...')
      state.community_cards[3].revealed = true
      state.community_cards[4].revealed = true
    }
    else if (state.round_stage == 2) {
      // reveal river
      console.log('Revealing river...')
      state.community_cards[4].revealed = true
    }
    // determine winner
    let winners = determineWinners(state)
    revealHands(state)
    allocateWinnings(room, state, winners)
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
  // Otherwise wait until each player has bet equally, folded or is all-in:
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
      //console.log(winners)
      revealHands(state)
      allocateWinnings(room, state, winners)
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

function checkIfGameConcluded(state: GameState) {
  let playersOut = 0
  console.log('Resetting round')
  state.players.forEach((player) => {
    player.cards = new ArraySchema<Card>()
    player.current_bet = 0
    player.isFolded = false
    player.isAllIn = false
    if (player.chips === 0 || player.isOut) playersOut+=1
  });
  console.log('%s / %s players are out.', playersOut, state.active_players.length)
  return (playersOut == state.active_players.length-1) ? true : false
}

export function roundReset(room: Room, state: GameState) {
  if (checkIfGameConcluded(state))
  {
    // game is over
    console.log('Game Over: Only one player remaining')
    concludeGame(room, state)
  } else {
    // reset variables
    state.largest_bet = 0
    state.pot = 0
    state.folded_players = 0
    state.matched_players = 0
    state.all_in_players = 0
    state.round_stage = 0
    //state.dealer_idx+=1
    state.community_cards = new ArraySchema<Card>()
    nextRound(room, state)
  }
}

function concludeGame(room: Room, state: GameState) {
  // connect to firebase and add debt
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