import http from "http"
import { Room, Client } from "colyseus.js"
import { Schema, MapSchema, type } from "@colyseus/schema";
import { hostname } from "os"

const TURN_TIMEOUT = 60

export class Player extends Schema {
    constructor() {
        super()
        this.uid = '111111'
        this.name = 'test'
        this.ready = false
    }
}

Schema.defineTypes(Player, {
    uid: 'string',
    name = 'string',
    ready = 'boolean'
})

export class State extends Schema {
    constructor() {
        super()
        this.host = Player
        this.players = MapSchema()
        this.stake = ''
        this.amount = 0
        this.chips = 0
        this.b_blind = 0
        this.s_blind = 0
    }
}
Schema.defineTypes(State, {
    host: { Player },
    players: { map: Player },
    stake: { number },
    amount: { number },
    chips: { number },
    b_blind: { number },
    s_blind: { number }
})


export class Game extends Room {
    // The channel where we register the room IDs.
    LOBBY_CHANNEL = "$lobbies"
    maxPlayers = 8

    // Generate a single 4 capital letter room ID.
    generateRoomIdSingle = () => {
        var result = []
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        var charactersLength = characters.length;
        for (var i = 0; i < 4; i++) {
            result.push(characters.charAt(Math.floor(Math.random() *
                charactersLength)))
        }
        let room_id = result.join('')
        return room_id
    }

    // 1. Get room IDs already registered with the Presence API.
    // 2. Generate room IDs until you generate one that is not already used.
    // 3. Register the new room ID with the Presence API.
    generateRoomId = () => {
        const currentIds = await this.presence.smembers(this.LOBBY_CHANNEL);
        let id;
        do {
            id = this.generateRoomIdSingle();
        } while (currentIds.includes(id));

        await this.presence.sadd(this.LOBBY_CHANNEL, this.roomId);
        return id;
    }

    // When room is initialized
    onCreate (options) {
        this.roomId = await this.generateRoomId()
        this.setState(new State())
        host, stake, amount, chips, b_blind, s_blind = options
        this.state.host = host
        this.state.players.push(host)
        this.state.stake = stake
        this.state.amount = amount
        this.state.chips = chips
        this.state.b_blind = b_blind
        this.state.s_blind = s_blind
        console.log()
    }

    // Authorize client based on provided options before WebSocket handshake is complete
    onAuth (client, options, request) { }

    // When client successfully join the room
    onJoin (client, options, auth) {
        this.state.players.set(client.sessionId, new Player())
    }

    // When a client leaves the room
    onLeave (client, consented) { 
        if (this.state.players.has(client.sessionId)) {
            this.state.players.delete(client.sessionId);
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () { }
}