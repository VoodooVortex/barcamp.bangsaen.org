// Socket.io server setup for real-time updates
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Global socket.io instance
let io: SocketIOServer | null = null;

/**
 * Initialize Socket.io server
 * Should be called once when the HTTP server starts
 */
export function initSocketServer(server: NetServer): SocketIOServer {
  if (io) {
    console.log("Socket.io already initialized");
    return io;
  }

  io = new SocketIOServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join slug-specific room
    socket.on("join:slug", (slug: string) => {
      const room = `live:${slug}`;
      socket.join(room);
      console.log(`Client ${socket.id} joined room ${room}`);
    });

    // Leave slug-specific room
    socket.on("leave:slug", (slug: string) => {
      const room = `live:${slug}`;
      socket.leave(room);
      console.log(`Client ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.io server initialized");
  return io;
}

/**
 * Get the Socket.io instance
 * Throws if not initialized
 */
export function getSocketServer(): SocketIOServer {
  if (!io) {
    throw new Error("Socket.io server not initialized. Call initSocketServer first.");
  }
  return io;
}

/**
 * Broadcast schedule update to all clients watching a specific slug
 */
export function broadcastScheduleUpdate(slug: string): void {
  if (!io) {
    console.warn("Socket.io not initialized, cannot broadcast");
    return;
  }

  const room = `live:${slug}`;
  io.to(room).emit("schedule:updated", { slug, timestamp: new Date().toISOString() });
  console.log(`Broadcast schedule update to room ${room}`);
}

/**
 * Broadcast time sync to all connected clients
 */
export function broadcastTimeSync(serverNow: string, timezone: string): void {
  if (!io) {
    return;
  }

  io.emit("time:sync", { serverNow, timezone });
}
