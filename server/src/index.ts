import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";

// init
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

// io
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", (reason) => {
    console.log(reason);
    console.log("a user disconnected");
  });

  socket.on("test-emit", (data) => {
    console.log("server:", data);
  });
});

//
app.get("/api/health", (_, res) => {
  res.json({ message: "Server is running!" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
