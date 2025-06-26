import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // 🔄 Chat Request Sent
  socket.on("chat_request_sent", ({ toUserId }) => {
    const receiverSocketId = getReceiverSocketId(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("chat_request_received");
    }
  });

  // ✅ Chat Request Responded
  socket.on("chat_request_responded", ({ toUserId, response }) => {
    const senderSocketId = getReceiverSocketId(toUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("chat_request_response", response);
    }
  });
});

export { io, app, server };
