// Socket.io server setup for real-time updates
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Store on globalThis so it survives Next.js HMR reloads
const globalForSocket = globalThis as typeof globalThis & {
  _io?: SocketIOServer;
};

/**
 * Initialize Socket.io server
 * Should be called once when the HTTP server starts
 */
export function initSocketServer(server: NetServer): SocketIOServer {
  if (globalForSocket._io) {
    console.log("Socket.io already initialized");
    return globalForSocket._io;
  }

  const io = new SocketIOServer(server, {
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

  globalForSocket._io = io;
  console.log("Socket.io server initialized");
  return io;
}

/**
 * Get the Socket.io instance
 * Throws if not initialized
 */
export function getSocketServer(): SocketIOServer {
  if (!globalForSocket._io) {
    throw new Error("Socket.io server not initialized. Call initSocketServer first.");
  }
  return globalForSocket._io;
}

/**
 * Broadcast schedule update to all clients watching a specific slug
 */
export function broadcastScheduleUpdate(slug: string): void {
  if (!globalForSocket._io) {
    console.warn("Socket.io not initialized, cannot broadcast");
    return;
  }

  const room = `live:${slug}`;
  globalForSocket._io.to(room).emit("schedule:updated", { slug, timestamp: new Date().toISOString() });
  console.log(`Broadcast schedule update to room ${room}`);
}

/**
 * Broadcast time sync to all connected clients
 */
export function broadcastTimeSync(serverNow: string, timezone: string): void {
  if (!globalForSocket._io) {
    return;
  }

  globalForSocket._io.emit("time:sync", { serverNow, timezone });
}
