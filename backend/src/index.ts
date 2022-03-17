/**
 * IMPORTANT: 
 * ---------
 * Do not manually edit this file if you'd like to use Colyseus Arena
 * 
 * If you're self-hosting (without Arena), you can manually instantiate a
 * Colyseus Server as documented here: 👉 https://docs.colyseus.io/server/api/#constructor-options 
 
import { listen } from "@colyseus/arena";

// Import arena config
import arenaConfig from "./arena.config";

// Create and listen on 2567 (or PORT environment variable.)
listen(arenaConfig);
*/

// Colyseus + Express
import { Server } from "@colyseus/core"
import { WebSocketTransport } from "@colyseus/ws-transport"
//import { uWebSocketsTransport } from "@colyseus/uwebsockets-transport"
import { monitor } from "@colyseus/monitor"
import { createServer } from "http"
import express from "express"
import basicAuth from "express-basic-auth";
import cors from "cors"
//import { MyRoom } from "./rooms/MyRoom"
import { Game } from "./rooms/Game"


const app = express()
const port = Number(process.env.port) || 3000

app.use(cors())
app.use(express.json())

const server = createServer(app)

const gameServer = new Server({
    transport: new WebSocketTransport({
        server // provide the custom server for `WebSocketTransport`
    })
})

const basicAuthMiddleware = basicAuth({
    // list of users and passwords
    users: {
        "admin": "admin",
    },
    // sends WWW-Authenticate header, which will prompt the user to fill
    // credentials in
    challenge: true
});

app.use("/colyseus", basicAuthMiddleware, monitor());

//gameServer.define('my_room', MyRoom)
gameServer.define('game', Game)
gameServer.listen(port, undefined, undefined, () => {
    console.log('Server listening on port ', port)
});
