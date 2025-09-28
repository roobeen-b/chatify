import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// applying authentication middleware to all the socket connections
io.use(socketAuthMiddleware);

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("Socket connection accepted for user:", socket.user.fullName);

  const userId = socket.userId;
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = [];
  }
  userSocketMap[userId].push(socket.id);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(
      "Socket connection disconnected for user:",
      socket.user.fullName
    );
    userSocketMap[userId] = userSocketMap[userId]?.filter(
      (socketId) => socketId !== socket.id
    );
    if (userSocketMap[userId]?.length === 0) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
