import path from "path";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 4000;

app.use(express.json({ limit: "5mb" }));
app.use(cors({ credentials: true, origin: ENV.CLIENT_URL }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get(/^\/(?!api\/).*/, (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

server.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
