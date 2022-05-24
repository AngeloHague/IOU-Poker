import { Room, Client } from "colyseus";
import { GameState, Player, Card, newDeck, readCard, shuffle, findBestHand } from "./schema/GameState";
import { getPlayerName, playerTurn, sendMessage, startGame } from "./ts/GameLogic";

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

  async onCreate (options: any) {
    let settings = options.settings

    this.setState(new GameState());
    this.state.stake = settings.stake
    this.state.amount = parseInt(settings.amount)
    this.state.chips = parseInt(settings.chips)
    this.state.b_blind = parseInt(settings.b_blind)
    this.state.s_blind = parseInt(settings.s_blind)

    this.roomId = await this.generateRoomId(); // get unique room code
    //this.roomId = '1111'; // create game with set room code for testing purposes
    console.log('Game created: ', this.roomId)

    this.onMessage("message", (client, message) => {
      console.log(client.sessionId, " said: ", message)
      sendMessage(this, this.state, message, getPlayerName(this.state, client.sessionId), false)
    });

    this.onMessage("changeReadyState", (client, message) => {
      if (this.state.game_started == false) {
        console.log(client.sessionId, "\'s ready state is now: ", message.isReady)
        let player = this.state.players.get(client.sessionId)
        player.ready = message.isReady
        this.state.players.set(client.sessionId, player)
        if (this.readyToStart()) {
          let timeout = 3 // debug purposes
          var timer = setInterval(() => {
            if (timeout <= 0) {
              clearInterval(timer)
              startGame(this, this.state)
            }
            if (!this.readyToStart()) {
              console.log('Player is no longer ready.')
              clearInterval(timer)
            } else {
              //console.log('Starting game in: ', timeout)
              let message = 'Starting game in ' + (timeout)
              sendMessage(this, this.state, message, 'server', true)
              timeout--
            }
          }, 1000);
          if (timeout <= 0) startGame(this, this.state)
        }
      }
    });

    this.onMessage("playerTurn", (client, message) => {
      playerTurn(this, this.state, client, message)
    });

  }

  onJoin (client: Client, options: any) {
    let settings = options.settings
    console.log(client.sessionId, "joined ", this.roomId);
    this.state.connected_players += 1

    if (this.state.game_started == false) {
      let player = new Player()
      player.uid = settings.uid
      player.name = settings.name
      player.ready = false
      player.chips = this.state.chips
      player.sessionId = client.sessionId

      this.state.players.set(client.sessionId, player)
    }
    
    let message = getPlayerName(this.state, client.sessionId) + ' has joined.'
    sendMessage(this, this.state, message, 'server', true)
  }

  async onLeave (client: Client, consented: boolean) {
    try {
      if (!this.state.game_started || this.state.game_over) {
        let message = getPlayerName(this.state, client.sessionId) + ' has left the game.'
        this.state.players.delete(client.sessionId)
        sendMessage(this, this.state, message, 'server', true)
        console.log(client.sessionId, "left!");
      }
      else {
        if (consented) {
          throw new Error('consented leave')
        } else {
          let message = getPlayerName(this.state, client.sessionId) + ' has disconnected. They have 60 seconds to reconnect before forfeiting.'
          sendMessage(this, this.state, message, 'server', true)
          //this.state.players.delete(client.sessionId)
          this.state.connected_players -= 1
          if (this.state.connected_players <= 0) {
            this.onDispose()
          }
          await this.allowReconnection(client, 60)
          console.log('Welcome Back')
          this.state.connected_players +=1
          message = getPlayerName(this.state, client.sessionId) + ' has returned.'
          sendMessage(this, this.state, message, 'server', true)
        }
      }
    } catch(e) {
      this.state.players.get(client.sessionId).isOut = true
      let message = getPlayerName(this.state, client.sessionId) + ' has forfeited the match. If it is still their turn, please wait for the turn timer to expire.'
      sendMessage(this, this.state, message, 'server', true)
    }
    
  }

  async onDispose() {
    this.presence.srem(this.LOBBY_CHANNEL, this.roomId);
    console.log("room", this.roomId, "disposing...");
  }

}
