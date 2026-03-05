// Custom server with Socket.io
// Run with: npm run dev (uses node --env-file=.env.local --require tsx/cjs)
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketServer } from "./lib/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error handling request:", err);
            res.statusCode = 500;
            res.end("Internal Server Error");
        }
    });

    // Initialize Socket.io
    initSocketServer(server);

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Socket.io server initialized`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down gracefully");
        server.close(() => {
            console.log("Server closed");
            process.exit(0);
        });
    });
});
