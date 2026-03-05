// Socket.io client hook for React components
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketOptions {
    slug: string;
    onScheduleUpdate?: () => void;
    onTimeSync?: (data: { serverNow: string; timezone: string }) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}

/**
 * React hook for Socket.io connection
 * Automatically joins the year-specific room and handles reconnection
 */
export function useSocket({
    slug,
    onScheduleUpdate,
    onTimeSync,
    onConnect,
    onDisconnect,
}: UseSocketOptions) {
    const socketRef = useRef<Socket | null>(null);
    const onScheduleUpdateRef = useRef(onScheduleUpdate);
    const onTimeSyncRef = useRef(onTimeSync);
    const onConnectRef = useRef(onConnect);
    const onDisconnectRef = useRef(onDisconnect);

    useEffect(() => {
        onScheduleUpdateRef.current = onScheduleUpdate;
    }, [onScheduleUpdate]);

    useEffect(() => {
        onTimeSyncRef.current = onTimeSync;
    }, [onTimeSync]);

    useEffect(() => {
        onConnectRef.current = onConnect;
    }, [onConnect]);

    useEffect(() => {
        onDisconnectRef.current = onDisconnect;
    }, [onDisconnect]);

    useEffect(() => {
        // Initialize socket connection
        const socket = io({
            path: "/api/socket",
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        socketRef.current = socket;

        // Connection handlers
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            // Join event-specific room
            socket.emit("join:slug", slug);
            onConnectRef.current?.();
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
            onDisconnectRef.current?.();
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
        });

        // Event handlers
        socket.on("schedule:updated", () => {
            console.log("Received schedule update");
            onScheduleUpdateRef.current?.();
        });

        socket.on("time:sync", (data) => {
            onTimeSyncRef.current?.(data);
        });

        // Cleanup on unmount
        return () => {
            socket.emit("leave:slug", slug);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [slug]);

    // Manual reconnect function
    const reconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.connect();
        }
    }, []);

    return {
        socket: socketRef.current,
        reconnect,
    };
}

/**
 * Hook to check socket connection status
 */
export function useSocketStatus() {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = io({
            path: "/api/socket",
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));

        return () => {
            socket.disconnect();
        };
    }, []);

    return { isConnected, socket: socketRef.current };
}
