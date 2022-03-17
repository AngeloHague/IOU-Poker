// Colyseus + Express
import { Server, RedisPresence, LobbyRoom } from "colyseus"
import { createServer } from "http";
import { Game } from "./rooms/game";
import express from "express";
const port = Number(process.env.port) || 3000;

const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app)
});

// start listening
gameServer.listen(port)

// define lobby room
gameServer.define("lobby", LobbyRoom)

//define poker table room
gameServer.define("game", Game)

gameServer.listen(port);