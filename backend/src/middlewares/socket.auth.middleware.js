import jwt from "jsonwebtoken";
import { ENV } from "../lib/env.js";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const cookie = socket.handshake.headers.cookie || "";
    const tokenMatch = cookie.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    if (!token) {
      console.log("Socket connection rejected: No token found");
      return next(new Error("Unauthorized - No token found"));
    }
    const decodedToken = jwt.verify(token, ENV.JWT_SECRET);
    if (!decodedToken) {
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid token"));
    }

    const user = await User.findById(decodedToken.userId);
    if (!user) {
      console.log("Socket connection rejected: User not found");
      return next(new Error("User not found"));
    }
    socket.user = user;
    socket.userId = user._id.toString();
    console.log("User authenticated for socket:", user.fullName);
    next();
  } catch (error) {
    console.log("Error in socket auth middleware:", error);
    next(new Error("Unauthorized - Authentication error"));
  }
};
