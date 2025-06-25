import { Server } from "socket.io";
import http from "http";
import express from "express";

// Create an Express app instance. This is the main app that will handle
// HTTP requests and eventually be passed to the HTTP server.
const app = express();

// Create an HTTP server using the Express app.
// Socket.IO will then attach itself to this HTTP server.
const server = http.createServer(app);

// Initialize Socket.IO server.
const io = new Server(server, {
  cors: {
    // Dynamically set the allowed origin for Socket.IO connections.
    // In production, this will be your deployed frontend URL (set via Render environment variable).
    // In development, it falls back to http://localhost:5173.
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    // It's good practice to explicitly allow the methods for CORS.
    methods: ["GET", "POST"],
    // Set credentials to true if your client will be sending cookies or authorization headers
    // with WebSocket connections. This usually aligns with the Express CORS setup.
    credentials: true,
  },
});

// This map will store the userId to socketId mapping for online users.
// This allows you to send messages to specific users.
const userSocketMap = {}; // {userId: socketId}

/**
 * Retrieves the socket ID for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {string | undefined} The socket ID if the user is online, otherwise undefined.
 */
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Listen for new Socket.IO connections.
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Extract the userId from the handshake query. This assumes your client
  // sends the userId when establishing the Socket.IO connection.
  const userId = socket.handshake.query.userId;

  // If a userId is provided, store the mapping in userSocketMap.
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Emit an event to all connected clients to update the list of online users.
  // Object.keys(userSocketMap) gets all user IDs that are currently online.
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for the 'disconnect' event when a user closes their connection.
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    // Remove the disconnected user from the map.
    delete userSocketMap[userId];
    // Emit an updated list of online users to all clients.
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export the Socket.IO server instance, the Express app, and the HTTP server.
// These are used by index.js to configure routes, middleware, and start listening.
export { io, app, server };