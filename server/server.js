"use strict";
exports.__esModule = true;
// Colyseus + Express
var colyseus_1 = require("colyseus");
var http_1 = require("http");
var game_1 = require("./rooms/game");
var express_1 = require("express");
var port = Number(process.env.port) || 3000;
var app = express_1["default"]();
app.use(express_1["default"].json());
var gameServer = new colyseus_1.Server({
    server: http_1.createServer(app)
});
// start listening
gameServer.listen(port);
// define lobby room
gameServer.define("lobby", colyseus_1.LobbyRoom);
//define poker table room
gameServer.define("game", game_1.Game);
gameServer.listen(port);
