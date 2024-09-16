const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors()); 

let allPlayers = [];
let gameRooms = [];

io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("findOpponent", ({ playerName }) => {
        console.log(`${playerName} is looking for an opponent.`);

        if (allPlayers.includes(playerName)) {
            socket.emit("serverMessage", `${playerName} is taken!`);
            return;
        }

        allPlayers.push(playerName);
        if (allPlayers.length >= 2) {
            const players = allPlayers.splice(0, 2); 
            let roomId = `gameRoom-${players[0]}-${players[1]}`;

            let newRoom = {
                id: roomId,
                players: {
                    player1: players[0],
                    player2: players[1]
                }
            };

            io.to(players[0]).emit("serverMessage", `Welcome ${players[0]}, you are now in a game with ${players[1]}!`);
            io.to(players[1]).emit("serverMessage", `Welcome ${players[1]}, you are now in a game with ${players[0]}!`);

            gameRooms.push(newRoom);

            socket.join(roomId);
            console.log(`New game created for ${players[0]} and ${players[1]} in room ${roomId}`);
            
        } else {
            socket.emit("serverMessage", `Searching for an opponent for ${playerName}...`);
        }

        console.log(`Added ${playerName} to the player queue.`);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});


app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
