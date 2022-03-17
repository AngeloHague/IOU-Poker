import { Room, Client } from "colyseus";
import { GameState, Player, Card, newDeck, readCard, shuffle, findBestHand } from "./schema/GameState";

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
    //this.lock() // prevent new users joining
    this.state.connected_players = this.state.players.size
    //set all players' ready status
    this.state.players.forEach((player, key) => {
      player.chips = this.state.chips
      player.ready = false
      this.state.players.set(key, player)
    })
    this.state.active_players = Array.from(this.state.players.keys())
    this.state.dealer_idx = 0
    this.state.player_idx = 1
    this.startRound()
    this.broadcast("startGame")
    //this.broadcast("start_round")
  }

  startRound() {
    let deck = newDeck()
    this.state.deck = shuffle(deck)
    this.dealCards(this.state.active_players)
    // reset variables
    this.state.largest_bet = 0
    this.state.pot = 0
    this.state.folded_players = 0
    this.state.matched_players = 0
    // assign dealer
    let no_players = this.state.active_players.length
    let d_idx = (this.state.dealer_idx) % no_players
    this.state.dealer = this.state.active_players[d_idx]
    // assign big blind player
    let bb_idx = (this.state.dealer_idx+1) % no_players
    this.state.bb_player = this.state.active_players[bb_idx]
    this.payBlind(this.state.bb_player, this.state.b_blind)
    // assign small blind player
    let sb_idx = (this.state.dealer_idx+2) % no_players
    this.state.sb_player = this.state.active_players[sb_idx]
    this.payBlind(this.state.sb_player, this.state.s_blind)
    // assign first player
    this.state.player_idx = this.state.dealer_idx+1
    this.state.current_player = this.state.active_players[this.state.player_idx]
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
    let winners: string[]
    let folded = 0
    let players = this.state.active_players
    players.forEach((key) => {
      let player = this.state.players.get(key)
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

  payBlind(player_id: string, blind: number) {
    if (blind >= this.state.players.get(player_id).chips) {
      let amount = this.state.players.get(player_id).chips
      this.state.players.get(player_id).chips -= amount
      this.state.players.get(player_id).current_bet = amount
      if (this.state.largest_bet < amount){
        this.state.largest_bet = amount
      }
    } else {
      this.state.players.get(player_id).chips -= blind
      this.state.players.get(player_id).current_bet = blind
      if (this.state.largest_bet < blind){
        this.state.largest_bet = blind
      }
    }
  }

  playerTurn (client: Client, turn: any) {
    if(client.sessionId === this.state.current_player) {
      // player turn
      //console.log(client.sessionId, ' is trying to performing an action...')
      if (turn.action == 'fold') {
        console.log(client.sessionId, " chose to fold")
        this.state.players.get(client.sessionId).folded = true
        this.state.folded_players+=1
        this.checkIfStageOver()
      } else if (turn.action == 'check') {
        console.log(client.sessionId, " chose to check")
        if (this.state.players.get(client.sessionId).current_bet == this.state.largest_bet || this.state.players.get(client.sessionId).chips == 0) {
          console.log(client.sessionId, " checked successfully")
          this.state.matched_players += 1
          this.checkIfStageOver()
        } else {
          client.send('error', 'You cannot check! Please match the current bet')
        }
      } else if (turn.action == 'bet') {
        console.log(client.sessionId, " chose to bet: ", turn.amount)
        //bet code
        if (turn.amount < this.state.largest_bet && this.state.players.get(client.sessionId).chips >= this.state.largest_bet) {
        } else if (turn.amount > this.state.largest_bet && this.state.players.get(client.sessionId).chips + this.state.players.get(client.sessionId).current_bet == turn.amount) {
          //all in
          this.state.players.get(client.sessionId).current_bet = turn.amount
          this.state.players.get(client.sessionId).chips -= turn.amount
          this.state.largest_bet = turn.amount
          this.state.pot += turn.amount
          this.state.matched_players = 1
          console.log(client.sessionId, " has gone all-in with: ", turn.amount)
          this.checkIfStageOver()
        } else if (turn.amount > this.state.largest_bet && this.state.players.get(client.sessionId).chips + this.state.players.get(client.sessionId).current_bet > this.state.largest_bet) {
          // new maximum
          this.state.players.get(client.sessionId).current_bet = turn.amount
          this.state.players.get(client.sessionId).chips -= turn.amount
          this.state.largest_bet = turn.amount
          this.state.pot += turn.amount
          this.state.matched_players = 1
          console.log(client.sessionId, " has raised to: ", turn.amount)
          this.checkIfStageOver()
        } else if (turn.amount == this.state.largest_bet && this.state.players.get(client.sessionId).chips + this.state.players.get(client.sessionId).current_bet >= this.state.largest_bet) {
          // matched bet
          this.state.players.get(client.sessionId).current_bet = turn.amount
          this.state.players.get(client.sessionId).chips -= turn.amount
          this.state.pot += turn.amount
          this.state.matched_players +=1
          console.log(client.sessionId, " has matched with: ", turn.amount)
          this.checkIfStageOver()
        } else if (turn.amount < this.state.largest_bet && this.state.players.get(client.sessionId).chips + this.state.players.get(client.sessionId).current_bet < this.state.largest_bet) {
          // split pot
          this.state.players.get(client.sessionId).current_bet = turn.amount
          this.state.players.get(client.sessionId).chips -= turn.amount
          this.state.pot += turn.amount
          this.state.matched_players +=1
          console.log(client.sessionId, " has gone all-in with: ", turn.amount)
          this.checkIfStageOver()
        }
      }
    }
  }

  nextPlayer() {
    console.log('Determining next player...')
    this.state.player_idx+=1
    let idx = this.state.player_idx % this.state.active_players.length
    let key = this.state.active_players[idx]
    let next_player = this.state.players.get(key)
    if (next_player.folded || next_player.chips == 0) {
      console.log('Player not active, finding next player...')
      this.nextPlayer()
    } else {
      this.state.current_player = key
      console.log('Next player set: ', key)
    }
  }

  checkIfStageOver() {
    if (this.state.active_players.length == this.state.folded_players-1) {
      // all other players folded
      let winners = this.foldWin()
      this.allocateWinnings(winners)
      console.log('All other players have folded. Winner is: ', winners[0])
    }
    else if (this.state.matched_players == this.state.active_players.length - this.state.folded_players) {
      console.log('Progressing to next stage:')
      // progress round to next stage
      if (this.state.round_stage == 0) {
        // reveal flop
        console.log('Revealing flop...')
        this.state.community_cards[0].revealed = true
        this.state.community_cards[1].revealed = true
        this.state.community_cards[2].revealed = true
      }
      else if (this.state.round_stage == 1) {
        // reveal turn
        console.log('Revealing turn...')
        this.state.community_cards[3].revealed = true
      }
      else if (this.state.round_stage == 2) {
        // reveal river
        console.log('Revealing river...')
        this.state.community_cards[4].revealed = true
      }
      else if (this.state.round_stage == 3) {
        // determine winner
        this.determineWinner()
        this.roundReset()
      }
      this.state.matched_players = 0 // reset stage variables
      this.state.round_stage += 1
    } else {
      console.log('Stage not over')
    }
    this.nextPlayer()
  }

  determineWinner() {
    let winners: string[];
    let winningHand = 0;
    console.log('Finding round winner')
    this.state.players.forEach((player, key) => {
      let besthand = findBestHand(this.state.community_cards, player.cards)
      if (besthand > winningHand) {
        winners = []
        winners.push(key)
      } else if (besthand == winningHand) {
        winners.push(key)
      }
    });
    if (winners.length == 1) {
      return winners[0]
    } else if (winners.length > 1) {
      // determine who has best card and return 
    }
  }

  roundReset() {
    console.log('Resetting round')
    this.state.dealer_idx += 1
    this.startRound()
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
        if (this.readyToStart()) {
          this.startGame()
        }
      }
    });

    this.onMessage("playerTurn", (client, turn) => {
      console.log(client.sessionId, ' is trying to performing an action on ', this.state.current_player, '\'s turn')
      this.playerTurn(client, turn)
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
