import { Room, Client } from "colyseus";
import { GameState, Player, Card, newDeck, readCard, shuffle, findBestHand } from "./schema/GameState";
import { playerTurn, startGame } from "./ts/GameLogic";

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

    //this.roomId = await this.generateRoomId(); // get unique room code
    this.roomId = '1111'; // create game with set room code for test
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
          startGame(this, this.state)
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
