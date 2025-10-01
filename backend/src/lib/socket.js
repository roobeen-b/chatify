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

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("Socket connection accepted for user:", socket.user.fullName);

  const userId = socket.userId;

  // Join a room for this user
  socket.join(userId);
  console.log(`User ${socket.user.fullName} (${userId}) joined their room`);

  // Track socket connections
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = [];
  }
  userSocketMap[userId].push(socket.id);

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle typing events
  socket.on("typing", (data) => {
    console.log("User typing: ", data);
    // Making sure the sender is the one who's actually typing
    if (data.senderId !== userId) {
      console.warn("Mismatched senderId in typing event");
      return;
    }
    // Emit to the specific receiver's room
    io.to(data.receiverId).emit("userTyping", data);
  });

  socket.on("stopTyping", (data) => {
    console.log("User stopped typing: ", data);
    if (data.senderId !== userId) {
      console.warn("Mismatched senderId in stopTyping event");
      return;
    }
    io.to(data.receiverId).emit("userStopTyping", data);
  });

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
