import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
//
import PongGame from "./game";

// initialize
dotenv.config();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
  })
);
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
  },
});
const PORT = process.env.PORT || 3001;
const pongGame = new PongGame();

// io
io.on("connection", (socket) => {
  console.log(`Player ${socket.id} connected.`);
  // add player to game
  const added = pongGame.addPlayer(socket);
  if (!added) {
    socket.emit("gameFull");
    socket.disconnect();
    return;
  }
  // handle player input
  socket.on("playerMove", (direction: "up" | "down") => {
    pongGame.movePlayer(socket.id, direction);
  });

  socket.on("playerReady", () => {
    pongGame.setPlayerReady(socket.id);
    console.log(`Set Player ${socket.id} ready.`);
  });

  socket.on("disconnect", () => {
    pongGame.removePlayer(socket.id);
    console.log(`Player ${socket.id} disconnected.`);
  });
});

setInterval(() => {
  io.emit("gameState", pongGame.getStateForClient());
}, 1000 / 60); // 60 FPS

//
app.get("/api/health", (_, res) => {
  res.json({ message: "Server is running!" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
