import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://54.191.101.14:5173"], // Add EC2 IP here
    credentials: true,
  },
});

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`📌 Mapped user ${userId} to socket ${socket.id}`);
  }

  // Broadcast updated online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ A user disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
      console.log(`🗑️ Removed mapping for user ${userId}`);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("chat_request_sent", ({ toUserId }) => {
    console.log(`📨 Chat request sent to ${toUserId}`);
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chat_request_received");
    }
  });

  socket.on("chat_request_responded", ({ toUserId, response }) => {
    console.log(`🔁 Chat request response sent to ${toUserId}: ${response}`);
    const senderSocketId = getReceiverSocketId(toUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("chat_request_response", response);
    }
  });

  socket.on("send_message", ({ toUserId, message }) => {
    console.log(`✉️ Message sent to ${toUserId}: ${message?.text || message}`);
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_received", message);
    }
  });
});

export { io, app, server };

