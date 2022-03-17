import { Room, Client } from "colyseus";
import { GameState, Player, Card, newDeck, readCard, shuffle } from "./schema/GameState";

const ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

export class Game extends Room<GameState> {
    // The channel where we register the room IDs.
    LOBBY_CHANNEL = "$lobby"

    // Generate a single 4-long alphanumeric room ID.
    // Alphanumeric ID is 36^4 possible combinations + date
    generateRoomIdSingle(): string {
        let result = '';
        for (var i = 0; i < 4; i++) {
            result += ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length));
        }
        return result;
    }

    // 1. Get room IDs already registered with the Presence API.
    // 2. Generate room IDs until you generate one that is not already used.
    // 3. Register the new room ID with the Presence API.
    async generateRoomId(): Promise<string> {
      const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
      let id;
      do {
          id = this.generateRoomIdSingle();
      } while (currentIds.includes(id));

      await this.presence.sadd(this.LOBBY_CHANNEL, this.roomId);
      return id;
  }

  readyToStart() {
    let numPlayers = this.state.players.size
    if (numPlayers > 1) { // require at least 2 players
      let count = 0
      this.state.players.forEach((player, key) => {
        if (player['ready'] == true) count+=1
      })
      if (count == numPlayers) return true
      else return false
    } else return false
  }

  startGame() {
    this.state.game_started = true
    this.lock() // prevent new users joining
    this.state.connected_players = this.state.players.size
    this.broadcast("startGame")
    //set all players' ready status
    this.state.players.forEach((player, key) => {
      player.chips = this.state.chips
      player.ready = false
    })
    this.state.active_players = await Array.from(this.state.players.keys())
  }

  async game() {
    this.state.active_players = await Array.from(this.state.players.keys())
    let deck = newDeck()
    this.state.deck = shuffle(deck)
    //console.log(this.state.active_players.keys)
    //console.log(this.state.deck)
    //this.round(this.state.active_players)
    //while (!this.state.winner) {
      // play round
      // shift active players array by 1 space (rotating dealer, big blind, small blind players)
    //}
  }

  async round(players: string[]) {
    console.log('New round with players: ', players)
    // reset variables
    this.state.largest_bet = 0
    this.state.pot = 0
    this.state.folded_players = 0
    this.state.matched_players = 0
    // assign dealer
    let no_players = players.length
    let d_idx = (this.state.player_idx-1) % no_players
    this.state.dealer = players[d_idx]
    // assign big blind player
    let bb_idx = (this.state.player_idx) % no_players
    this.state.bb_player = players[bb_idx]
    // assign small blind player
    let sb_idx = (this.state.player_idx+1) % no_players
    this.state.sb_player = players[sb_idx]
    // pay blinds (small blind first for sake of not throwing an error)
    await this.playerBet(this.state.sb_player, this.state.s_blind)
    await this.playerBet(this.state.bb_player, this.state.b_blind)
    // deal cards
    this.dealCards(players)
    // bet cycle
    await this.bettingPhase().then(async (res) => {
      if (res == 'check') {
        //reveal the flop (3 cards)
        this.state.community_cards[0].revealed = true
        this.state.community_cards[1].revealed = true
        this.state.community_cards[2].revealed = true
        this.state.matched_players = 0 // reset to allow for checking
        // bet cycle
        await this.bettingPhase().then(async (res) => {
          if (res == 'check') {
            //reveal the turn (4th)
            this.state.community_cards[3].revealed = true
            this.state.matched_players = 0 // reset to allow for checking
            // bet cycle
            await this.bettingPhase().then(async (res) => {
              if (res == 'check') {
                //reveal the river (5th)
                this.state.community_cards[4].revealed = true
                this.state.matched_players = 0 // reset to allow for checking
                // bet cycle
                await this.bettingPhase().then((res) => {
                  if (res == 'check') {
                    // determine winner
                    //this.allocateWinnings(winners)
                  } else if (res == 'fold_win') {
                    let winners = this.foldWin()
                    this.allocateWinnings(winners)
                  }
                });
              } else if (res == 'fold_win') {
                let winners = this.foldWin()
                this.allocateWinnings(winners)
              }
            });
          } else if (res == 'fold_win') {
            let winners = this.foldWin()
            this.allocateWinnings(winners)
          }
        });
      } else if (res == 'fold_win') {
        let winners = this.foldWin()
        this.allocateWinnings(winners)
      }
    });
    
    // shift active players
    let last_dealer = players.shift() // remove dealer
    players.push(last_dealer) // add to end
    return players
  }

  allocateWinnings(winners: string[]) {
    winners.forEach((winner) => {
      try {
        if (this.state.pot > 0) {
          let max_payout = this.state.players.get(winner).current_bet * this.state.betting_players.size
          if (max_payout >= this.state.pot) {
            console.log(winner, ' has won ', this.state.pot,' chips')
            this.state.players.get(winner).chips += this.state.pot
            this.state.pot = 0
          } else {
            if (max_payout < this.state.pot) {
              console.log(winner, ' has won ', max_payout,' chips')
              this.state.players.get(winner).chips += max_payout
              this.state.pot -= max_payout
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

  foldWin() {
    console.log('Checking for fold victory')
    let winner: string[]
    let folded = 0
    let players = this.state.active_players
    players.forEach((key) => {
      let player = this.state.players.get(key)
      console.log('Checking if ', key, ' has folded')
      if (player.folded == true) {
        console.log(key, ' has folded.')
        folded+=1
      } else {
        winner.push(key)
      }
    });

    if (winner.length == 1) {
      console.log(winner[0], 'wins!')
      return winner
    }
  }

  revealCards () {

  }

  async bettingPhase () {
    let betting = true;
    while (betting) {
      let players = this.state.active_players
      let player_idx = this.state.player_idx % players.length
      let player = players[player_idx]
      console.log('Ready to listen')
      await this.onMessage("player_turn", (client, turn) => {
        console.log('Listening for player actions')
        console.log(client.sessionId, 'is trying to communicate...')
        if (player = client.sessionId) {
          console.log('...it is their turn')
        } else {
          console.log('...it is not their turn')
        }
      });
      /*await this.playerTurn(player).then(() => {
        this.state.player_idx+=1 // next player
        //determine if keep betting
        let active = this.state.active_players.length
        let folded = this.state.folded_players
        let matched = this.state.matched_players
        if (folded == active-1) {
          // round over: there is winner
          resolve('fold_win')
        }
        if (matched == active-folded) {
          // no more betting, reveal community cards
          resolve('check')
        }
      });*/
    }
  }

  async playerBet(current_better: string, amount: number) {
    return new Promise((resolve, reject) => {
      this.state.players.get(current_better).current_bet = amount 
      console.log(current_better, " chose to bet ", amount)
      if (amount < this.state.largest_bet && this.state.players.get(current_better).chips >= this.state.largest_bet) {
        reject('too-low')
      } else if (amount > this.state.largest_bet && this.state.players.get(current_better).chips + this.state.players.get(current_better).current_bet == amount) {
        //all in
        this.state.players.get(current_better).current_bet = amount
        this.state.players.get(current_better).chips -= amount
        this.state.largest_bet = amount
        this.state.pot += amount
        this.state.matched_players = 1
        resolve('all-in')
      } else if (amount > this.state.largest_bet && this.state.players.get(current_better).chips + this.state.players.get(current_better).current_bet > this.state.largest_bet) {
        // new maximum
        this.state.players.get(current_better).current_bet = amount
        this.state.players.get(current_better).chips -= amount
        this.state.largest_bet = amount
        this.state.pot += amount
        this.state.matched_players = 1
        resolve('raise')
        //this.nextPlayer()
      } else if (amount == this.state.largest_bet && this.state.players.get(current_better).chips + this.state.players.get(current_better).current_bet >= this.state.largest_bet) {
        // matched bet
        this.state.players.get(current_better).current_bet = amount
        this.state.players.get(current_better).chips -= amount
        this.state.pot += amount
        this.state.matched_players +=1
        resolve('match')
        //this.nextPlayer()
      } else if (amount < this.state.largest_bet && this.state.players.get(current_better).chips + this.state.players.get(current_better).current_bet < this.state.largest_bet) {
        // split pot
        this.state.players.get(current_better).current_bet = amount
        this.state.players.get(current_better).chips -= amount
        this.state.pot += amount
        this.state.matched_players +=1
        resolve('split-pot')
        //this.nextPlayer()
      }
    })
  }

  playerTurn (client: Client, turn: any) {
    console.log(client.sessionId, ' is trying to performing an action on ', this.state.current_player, '\'s turn')
    if(client.sessionId === this.state.current_player) {
      // player turn
      console.log(client.sessionId, ' is trying to performing an action...')
      if (turn.action == 'fold') {
        this.state.players.get(client.sessionId).folded = true
        this.state.folded_players+=1
        console.log(client.sessionId, " chose to fold")
        this.checkIfRoundOver()
      } else if (turn.action == 'check') {
        if (this.state.players.get(client.sessionId).current_bet == this.state.largest_bet || this.state.players.get(client.sessionId).chips == 0) {
          console.log(client.sessionId, " chose to check")
          this.state.matched_players += 1
          resolve('check')
        } else {
          client.send('error', 'You cannot check! Please match the current bet')
        }
      } else if (turn.action == 'bet') {
        console.log(client.sessionId, " chose to bet")
        this.playerBet(client.sessionId, parseInt(turn.amount))
        .then((res) => {
        })
        .catch((err) => {
          if (err == 'too-low') {
            client.send('warning', 'Your bet is too low! Please match the current bet')
          }
        })
      }
    }
  }

  checkIfRoundOver() {
    if (this.state.matched_players == this.state.active_players.length - this.state.folded_players)
  }

  playerTurnOld (current_better: string) {
    console.log(current_better, '\'s turn')
    //let player_keys = Array.from(this.state.players.keys())
    //let current_better = player_keys[this.state.player_idx]
    return new Promise((resolve) => {
      // Turn Timer
      var timer = setTimeout(() => {
        console.log(current_better, ' timed out')
        this.state.players.get(current_better).folded = true
        this.state.folded_players+=1
        console.log(current_better, " folded due to inactivity")
        resolve('fold')
      }, 60000); // 60s turn timer

      console.log('Listening for player input')

      this.onMessage("player_turn", (client, turn) => {
        console.log(client.sessionId, ' is trying to performing an action...')
        if (client.sessionId == current_better) {
          // player turn
          console.log(current_better, ' is trying to performing an action...')
          if (turn.action == 'fold') {
            this.state.players.get(current_better).folded = true
            this.state.folded_players+=1
            console.log(client.sessionId, " chose to fold")
            resolve('fold')
          } else if (turn.action == 'check') {
            if (this.state.players.get(current_better).current_bet == this.state.largest_bet || this.state.players.get(current_better).chips == 0) {
              console.log(client.sessionId, " chose to check")
              this.state.matched_players += 1
              resolve('check')
            } else {
              client.send('error', 'You cannot check! Please match the current bet')
            }
          } else if (turn.action == 'bet') {
            console.log(client.sessionId, " chose to bet")
            this.playerBet(current_better, parseInt(turn.amount))
            .then((res) => {
              clearTimeout(timer)
            })
            .catch((err) => {
              if (err == 'too-low') {
                client.send('warning', 'Your bet is too low! Please match the current bet')
              }
            })
          }
        }
      });
    });
  }

  checkIfContinueBetting() {
    let active = this.state.active_players.length
    let folded = this.state.folded_players
    let matched = this.state.matched_players
    return new Promise((resolve, reject) => {
      if (folded == active-1) {
        // round over: there is winner
        resolve('fold_win')
      } else if (matched == active-folded) {
        // no more betting, reveal community cards
        resolve('reveal_cards')
      } else {
        // conmtinue betting
        reject('continue_bets')
      }
    });
  }

  async awaitResponse() {
    let counter = 60
        var countdown = setInterval(() => {
          if (counter > 0 && this.readyToStart()) {
            console.log('Starting game in: ', counter)
            this.broadcast("starting", counter)
            if (counter==0) {
              console.log('Starting the game')
              this.broadcast("startGame")
              this.startGame()
            counter -= 1
            }
          } else {
            clearInterval(countdown)
          }
          
        }, 1000)
  }

  async betCycle(players: string[]) {
    let betting = true
    let no_players = players.length
    let folded_players = 0
    let matched_players = 0
    while(betting) {
      players.forEach(async (key) => {
        if (this.state.players.get(key).folded == false) {
          if (folded_players == no_players-1) {
            // current player wins
            betting = false
          } else if (matched_players == no_players-folded_players) {
            // end betting cycle
            betting = false
          } else {
            console.log('Waiting for response from ', key)
            let response_received = false
            // broadcast player turn
            this.broadcast("player_turn", key)
            // listen for player's response
            this.onMessage("player_turn", (client, turn) => {
              if (client.sessionId == key) {
                if (turn.action == 'fold') {
                  this.state.players.get(key).folded = true
                  folded_players+=1
                  console.log(client.sessionId, " chose to fold")
                } else if (turn.action == 'bet') {
                  this.state.players.get(key).current_bet = turn.amount 
                  console.log(client.sessionId, " chose to bet ", turn.amount)
                  if (turn.amount < this.state.largest_bet && this.state.players.get(key).chips >= this.state.largest_bet) {
                    client.send('warning', 'You cannot bet less than the current bet')
                  } else if (turn.amount > this.state.largest_bet && this.state.players.get(key).chips >= this.state.largest_bet) {
                    // new maximum
                    this.state.players.get(key).current_bet = turn.amount
                    this.state.largest_bet = turn.amount
                    this.state.pot += turn.amount
                    matched_players = 0
                    response_received = true
                  } else if (turn.amount == this.state.largest_bet && this.state.players.get(key).chips >= this.state.largest_bet) {
                    // matched bet
                    this.state.players.get(key).current_bet = turn.amount
                    this.state.pot += turn.amount
                    matched_players +=1
                    response_received = true
                  } else if (turn.amount < this.state.largest_bet && this.state.players.get(key).chips < this.state.largest_bet) {
                    // split pot
                    this.state.players.get(key).current_bet = turn.amount
                    this.state.pot += turn.amount
                    matched_players +=1
                    response_received = true
                  }
                }
              }
            });

            // count 30s before moving to next player
            let counter = 30
            let response = await new Promise(resolve => {
              const countdown = setInterval(() => {
                if (counter > 0 && !response_received) {
                  counter -= 1
                  if (counter==0) {
                    console.log('Player timed out')
                    resolve('Timeout')
                  }
                } else {
                  resolve('Success')
                  clearInterval(countdown)
                }
              }, 1000);
            });
            if (response = 'Timeout') {
              this.state.players.get(key).folded = true
              folded_players+=1
              console.log(key, " folded due to inactivity")
            }
          }

          
          // await response
          // if bet
          // if fold
        }
      })
    }
  }

  dealCards(activePlayers: string[]) {
    //deal 2 cards to each player
    for (var i = 0; i < 2;  i++) {
      activePlayers.forEach((key) => {
        let card = this.state.deck.pop()
        card.owner = key
        //console.log(key, '\'s card: ', card.value)
        this.state.players.get(key).cards.push(card)
      })
    }
    // deal 5 community cards
    for (var i = 0; i < 5; i++) {
      this.state.community_cards.push(this.state.deck.pop())
    }
  }

  async onCreate (options: any) {
    let settings = options.settings

    this.setState(new GameState());
    this.state.stake = settings.stake
    this.state.amount = settings.amount
    this.state.chips = parseInt(settings.chips)
    this.state.b_blind = parseInt(settings.b_blind)
    this.state.s_blind = parseInt(settings.s_blind)

    this.roomId = await this.generateRoomId();
    console.log('Game created: ', this.roomId)

    this.onMessage("message", (client, message) => {
      console.log(client.sessionId, " said: ", message.contents)
    });

    this.onMessage("changeReadyState", (client, message) => {
      if (this.state.game_started == false) {
        console.log(client.sessionId, "\'s ready state is now: ", message.isReady)
        let player = this.state.players.get(client.sessionId)
        player.ready = message.isReady
        this.state.players.set(client.sessionId, player)
        
        let counter = 4
        if (this.readyToStart()) {
          var countdown = setInterval(() => {
            if (counter > 0 && this.readyToStart()) {
              counter -= 1
              console.log('Starting game in: ', counter)
              this.broadcast("starting", counter)
              if (counter==0) {
                console.log('Starting the game')
                this.broadcast("startGame")
                this.startGame()
              }
            } else {
              clearInterval(countdown)
            }
            
          }, 1000)
        }
      }
    });

  }

  onJoin (client: Client, options: any) {
    let settings = options.settings
    console.log(client.sessionId, "joined ", this.roomId);

    if (!this.state.host) {
      this.state.host = client.sessionId
      console.log(client.sessionId, " is now the host of ", this.roomId)
    }

    let player = new Player()
    player.uid = settings.uid
    player.name = settings.name
    player.ready = false
    player.sessionId = client.sessionId

    this.state.players.set(client.sessionId, player)
  }

  onLeave (client: Client, consented: boolean) {
    if (this.state.game_started == false) {
      this.state.players.delete(client.sessionId)
      if (this.state.host == client.sessionId) {
        console.log("Host has left room ", this.roomId)
        let remaining_players = this.state.players.keys()
        try {
          let new_host = remaining_players.next()
          this.state.host = new_host.value
          console.log(this.state.host, " is now the host of ", this.roomId)
        }
        catch {
          console.log("Can't assign new host, closing lobby")
          this.onDispose()
        }
      }
    }
    else {
      this.allowReconnection(client)
      this.state.connected_players -= 1
      if (this.state.connected_players <= 0) {
        this.onDispose()
      }
    }
    
    console.log(client.sessionId, "left!");
  }

  async onDispose() {
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
    console.log("room", this.roomId, "disposing...");
  }

}
