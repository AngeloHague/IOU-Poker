import { Room, Client } from "colyseus";
import { Schema, MapSchema, ArraySchema, Context, type, filter } from "@colyseus/schema";
import { GameState, Player, Card, newDeck, readCard, shuffle, findBestHand, Hand, determineWinners } from "../schema/GameState";
import { Game } from "../Game";
import { HAND_NAME_MAP } from "../schema/constants";
import { debts } from "../../firebase";

// START GAME:
export function startGame(room: Room, state: GameState) {
  room.clock.start()
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
  sendMessage(room, state, 'Game Started', 'server', true)
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
  if(client.sessionId === state.current_player && state.round_over == false) {
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
  let message = getPlayerName(state, player.sessionId) + ' has folded.'
  sendMessage(room, state, message, 'server', true)
  checkIfStageOver(room, state)
}

// function playerFold(room: Room, state: GameState, client: Client) {
//   state.players.get(client.sessionId).isFolded = true
//   state.folded_players+=1
//   checkIfStageOver(room, state)
// }

function playerCheck(room: Room, state: GameState, player: Player) {
  if (player.current_bet == state.largest_bet || player.chips == 0) {
      let message = getPlayerName(state, player.sessionId) + " has checked."
      sendMessage(room, state, message, 'server', true)
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
  let message = getPlayerName(state, player.sessionId) + ' called, adding ' + increase + ' to the pot.'
  sendMessage(room, state, message, 'server', true)
  console.log(player.sessionId + ' called, adding ' + increase + '. Total Pot: ' + state.pot)
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
  let message = getPlayerName(state, player.sessionId) + ' went all-in with ' + amount + '.'
  sendMessage(room, state, message, 'server', true)
  console.log(player.sessionId + ' went all-in with: ' + amount + '. Total Pot: ' + state.pot)
  checkIfStageOver(room, state)
}

function playerRaise(room: Room, state: GameState, player: Player, amount: number) {
  if (amount == player.chips && player.current_bet + amount > state.largest_bet) {
    playerAllIn(room, state, player)
  } else if (player.current_bet + amount > state.largest_bet) {
    if (amount <= player.chips) {
      player.chips -= amount
      player.current_bet += amount
      state.largest_bet = player.current_bet
      state.pot += amount
      state.matched_players = 1
      let message = getPlayerName(state, player.sessionId) + ' raised by ' + amount + '.'
      sendMessage(room, state, message, 'server', true)
      console.log(player.sessionId + ' raised by: ' + amount + '. Total Pot: ' + state.pot)
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
    announceWhoseTurn(room, state);
  }
}

function revealHands(state: GameState) {
  state.players.forEach(player => {
    player.cards.forEach(card => card.revealed = true)
  });
}

function allocateWinnings(room: Room, state: GameState, winners: any[], isFold: boolean) {
  if (isFold) {
    let winner = state.players.get(winners[0])
    // Full Payout
    console.log(winner.sessionId, ' has won ', state.pot,' chips due to others folding')
    let message = winner.sessionId + ' has won ' + state.pot + ' chips.'
    sendMessage(room, state, message, 'server', true)
    winner.chips += state.pot
    state.pot = 0
  } else {
    winners.forEach((winning_hands) => {
      try {
        if (state.pot > 0) {
          if (winning_hands.length > 1) {
            // multiple winners
            payOutSplitPot(room, state, winners);
          } else if (winning_hands.length == 1) {
            // one winner
            payOut(room, state, winning_hands[0], checkMaxPayout(state, state.players.get(winning_hands[0].owner)));
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
      payOut(room, state, winners[0][0], checkMaxPayout(state, state.players.get(winners[0][0].owner)));
    }
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
function splitSidePots(room: Room, state: GameState, pots: any[]) {
  let split_pot = Math.floor(state.pot / pots.length)
  let remaining_pots: any = []

  pots.forEach(pot => {
    let max_split = Math.floor(pot.pot / pots.length)
    if (max_split <= split_pot) {
      // payout
      payOut(room, state, pot.winner, max_split)
    } else remaining_pots.push(pot)
  });
  if (remaining_pots == pots.length) {
    return remaining_pots
  } else splitSidePots(room, state, remaining_pots)
};

function payOutSplitPot(room: Room, state: GameState, winners: Hand[]) {
  let pots: any = []
  winners.forEach(winner => {
    let max_payout = checkMaxPayout(state, state.players.get(winner.owner))
    pots.push({pot: max_payout, winner: winner})
  })
  // Sort Ascending
  pots.sort((a: any, b:any) => {
    return a.pot - b.pot
  });
  let remaining_pots = splitSidePots(room, state, pots)
  if (remaining_pots.length > 0) {
    let split_pot = Math.floor(state.pot / remaining_pots.length)
    remaining_pots.forEach((pot: any) => {
      payOut(room, state, pot.winner, split_pot)
    });
  }
}

function payOut(room: Room, state: GameState, winning_hand: Hand, max_payout: number) {
  let winner = state.players.get(winning_hand.owner)
  if (max_payout >= state.pot) {
    // Full Payout
    console.log(winner.sessionId, ' has won ', state.pot,' chips with a ', HAND_NAME_MAP.get(winning_hand.rank))
    let message = getPlayerName(state, winner.sessionId) + ' has won ' + state.pot + ' chips with a '+ HAND_NAME_MAP.get(winning_hand.rank)
    sendMessage(room, state, message, 'server', true)
    winner.chips += state.pot
    state.pot = 0
  } else {
    // Partial Payout (Side Pots)
    if (max_payout < state.pot) {
      console.log(winner.sessionId, ' has won a side-pot of ', max_payout,' chips with a ', HAND_NAME_MAP.get(winning_hand.rank))
      let message = getPlayerName(state, winner.sessionId) + ' has won a side-pot of ' + state.pot + ' chips with a '+ HAND_NAME_MAP.get(winning_hand.rank)
      sendMessage(room, state, message, 'server', true)
      winner.chips += max_payout
      state.pot -= max_payout
    }
  }
}


export function foldWin(room: Room, state: GameState) {
  console.log('Checking for fold victory')
  let winners: string[] = []
  let folded = 0
  //let players = state.active_players
  state.players.forEach((player) => {
    console.log('Checking if ', player.sessionId, ' has folded')
    if (player.isFolded == true) {
      console.log(player.sessionId, ' has folded.')
      folded+=1
    } else {
      winners.push(player.sessionId)
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

// Called at the end every turn to progress to the next stage of the game
export function checkIfStageOver(room: Room, state: GameState) {
  // if everyone else has folded, last player remaining wins:
  if (state.active_players.length-1 == state.folded_players) {
    // all other players folded
    state.round_over = true
    let winners = foldWin(room, state)
    allocateWinnings(room, state, winners, true)
    console.log('All other players have folded. Winner is: ', winners[0])
    let message = getPlayerName(state, winners[0]) + ' wins.'
    sendMessage(room, state, message, 'server', true)
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
  } else if (state.all_in_players == state.active_players.length) {
    // all players are all in
    // reveal remaining cards
    if (state.round_stage == 0) {
      state.community_cards[0].revealed = true
      state.community_cards[1].revealed = true
      state.community_cards[2].revealed = true
      state.community_cards[3].revealed = true
      state.community_cards[4].revealed = true
      let message ='Revealing community cards.'
      sendMessage(room, state, message, 'server', true)
    }
    else if (state.round_stage == 1) {
      // reveal turn
      console.log('Revealing turn...')
      state.community_cards[3].revealed = true
      state.community_cards[4].revealed = true
      let message = 'Revealing turn & river.'
      sendMessage(room, state, message, 'server', true)
    }
    else if (state.round_stage == 2) {
      // reveal river
      console.log('Revealing river...')
      state.community_cards[4].revealed = true
      let message = 'Revealing river.'
      sendMessage(room, state, message, 'server', true)
    }
    // determine winner
    state.round_over = true
    let winners = determineWinners(state)
    revealHands(state)
    allocateWinnings(room, state, winners, false)
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
      let message = 'Revealing flop.'
      sendMessage(room, state, message, 'server', true)
    }
    else if (state.round_stage == 1) {
      // reveal turn
      console.log('Revealing turn...')
      state.community_cards[3].revealed = true
      let message = 'Revealing turn.'
      sendMessage(room, state, message, 'server', true)
    }
    else if (state.round_stage == 2) {
      // reveal river
      console.log('Revealing river...')
      state.community_cards[4].revealed = true
      let message = 'Revealing river.'
      sendMessage(room, state, message, 'server', true)
    }
    else if (state.round_stage == 3) {
      let message = 'Determining winner...'
      sendMessage(room, state, message, 'server', true)
      // determine winner
      //determineWinner(room, state)
      state.round_over = true
      let winners = determineWinners(state)
      //console.log(winners)
      revealHands(state)
      allocateWinnings(room, state, winners, false)
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

function announceGameWinner(room: Room, state: GameState) {
  state.turn_idx+=1
  state.players.forEach((player) => {
    if (player.chips != 0 && !player.isOut) {
      let message = 'Game Over! ' + player.name + ' has won the game!'
      state.game_over = true
      sendMessage(room, state, message, 'server', true)
      sendMessage(room, state, 'Lobby disposing in 60 seconds.', 'server', true)
    }
  });
  room.clock.setTimeout(() => {
    room.disconnect()
  }, 60_000); // 60 seconds
}

export function roundReset(room: Room, state: GameState) {
  if (checkIfGameConcluded(state))
  {
    // game is over
    console.log('Game Over: Only one player remaining')
    announceGameWinner(room, state)
    concludeGame(room, state)
  } else {
    // reset variables
    state.largest_bet = 0
    state.pot = 0
    state.folded_players = 0
    state.matched_players = 0
    state.all_in_players = 0
    state.round_stage = 0
    state.round_over = false
    //state.dealer_idx+=1
    state.community_cards = new ArraySchema<Card>()
    
    sendMessage(room, state, 'Next Round Started', 'server', true)
    nextRound(room, state)
  }
}

async function concludeGame(room: Room, state: GameState) {
  // connect to firebase and add debt
  if (state.stake != null && state.stake != 'null' && state.stake != '' && state.stake != ' ' && state.amount != 0) {
    console.log('Adding debt to firestore...') // debug purposes
    console.log('Stake: %s, Amount: %s', state.stake, state.amount) // debug purposes
    let [winners, losers]: any = [[],[]]
    state.players.forEach((player) => {
      if (player.chips === 0 || player.isOut) {
        losers.push(player.sessionId)
      } else {
        winners.push(player.sessionId)
      }
    })
    if (winners.length == 1) {
      let winner = winners[0]
      losers.forEach((loser: string) => {
        let debt = {
          amount: state.amount,
          stake: state.stake,
          sender: getPlayerUID(state, loser),
          senderName: getPlayerName(state, loser),
          recipient: getPlayerUID(state, winner),
          recipientName: getPlayerName(state, winner),
          approved_by_sender: false,
          approved_by_recipient: false,
          completed: false,
        }
        debts.add(debt).then((res: any) => {
          console.log('Added debt: ', res.id)
      })
      });
    }
  } else {
    console.log('4fun game finished') // debug purposes
  }
}

export function getPlayerName(state: GameState, clientID: string) {
  let item = state.players.get(clientID)
  return item.name
}

export function getPlayerUID(state: GameState, clientID: string) {
  let item = state.players.get(clientID)
  return item.uid
}

export function announceWhoseTurn(room: Room, state: GameState) {
  state.turn_idx+=1
  let player = state.current_player
  console.log("Player Turn: ", player)
  let message = 'It is now ' + getPlayerName(state, player) + '\'s turn.'
  sendMessage(room, state, (message), 'server', true)
  
  let turnIdx = state.turn_idx
  console.log('Starting %s\'s turn timer.', player)
  let turnTimer = room.clock.setTimeout(() => {
    playerFold(room, state, state.players.get(player))
  }, 60_000); // 60 seconds
  let interval = room.clock.setInterval(() => {
    //console.log('Checking %s\'s turn timer.', player)
    if (turnIdx != state.turn_idx) {
      console.log('Clearing %s\'s turn timer.', player)
      turnTimer.clear()
      interval.clear()
    }
  }, 1000);
}

export function sendMessage(room: Room, state: GameState, contents: string, sender: string, is_notif: boolean) {
  room.broadcast('message', {index: state.chat_idx, message: contents, sender: sender, isNotification: is_notif})
  state.chat_idx+=1
  // sendMessage(room, state, 'Chat', client.sessionId, false)
  // sendMessage(room, state, 'Notification', 'server', true)
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