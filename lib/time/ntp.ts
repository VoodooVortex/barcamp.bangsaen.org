// NTP Time Service for server time synchronization
// Uses pool.ntp.org as the time source with fallback to system time

import { createSocket } from "dgram";

interface NtpPacket {
    li: number;
    vn: number;
    mode: number;
    stratum: number;
    poll: number;
    precision: number;
    rootDelay: number;
    rootDispersion: number;
    referenceId: number;
    referenceTimestamp: bigint;
    originateTimestamp: bigint;
    receiveTimestamp: bigint;
    transmitTimestamp: bigint;
}

interface TimeInfo {
    serverNow: string;
    offsetMs: number;
    source: "ntp" | "system";
    lastSyncAt: string;
    timezone: string;
}

// NTP server configuration
const NTP_SERVERS = [
    "pool.ntp.org",
    "time.google.com",
    "time.windows.com",
];
const NTP_PORT = 123;
const NTP_EPOCH_OFFSET = 2208988800000; // 1900 to 1970 in milliseconds

// In-memory cache for time offset
let cachedOffset: { offsetMs: number; lastSyncAt: Date; source: "ntp" | "system" } | null = null;
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Parse NTP packet buffer into structured data
 */
function parseNtpPacket(buffer: Buffer): NtpPacket {
    return {
        li: (buffer[0] >> 6) & 0x3,
        vn: (buffer[0] >> 3) & 0x7,
        mode: buffer[0] & 0x7,
        stratum: buffer[1],
        poll: buffer[2],
        precision: buffer[3],
        rootDelay: buffer.readUInt32BE(4),
        rootDispersion: buffer.readUInt32BE(8),
        referenceId: buffer.readUInt32BE(12),
        referenceTimestamp: buffer.readBigUInt64BE(16),
        originateTimestamp: buffer.readBigUInt64BE(24),
        receiveTimestamp: buffer.readBigUInt64BE(32),
        transmitTimestamp: buffer.readBigUInt64BE(40),
    };
}

/**
 * Convert NTP timestamp (64-bit) to JavaScript Date
 * NTP timestamp is seconds since 1900-01-01 with fractional part in the lower 32 bits
 */
function ntpToDate(timestamp: bigint): Date {
    // High 32 bits: seconds since 1900
    // Low 32 bits: fractional seconds
    const twoPow32 = BigInt(0x100000000);
    const seconds = Number(timestamp / twoPow32);
    const fraction = Number(timestamp % twoPow32);
    const milliseconds = seconds * 1000 + (fraction * 1000) / 0x100000000;
    // Convert from 1900 epoch to 1970 epoch
    return new Date(milliseconds - NTP_EPOCH_OFFSET);
}

/**
 * Query NTP server for current time
 * Returns the server time and round-trip delay
 */
async function queryNtpServer(server: string): Promise<{ serverTime: Date; delayMs: number }> {
    return new Promise((resolve, reject) => {
        const client = createSocket("udp4");
        const ntpData = Buffer.alloc(48);

        // Build NTP request packet
        // LI=0, VN=4, Mode=3 (client)
        ntpData[0] = 0x23;
        ntpData[1] = 0;
        ntpData[2] = 0;
        ntpData[3] = 0;

        const requestTime = Date.now();

        client.on("error", (err) => {
            client.close();
            reject(err);
        });

        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const closeAndResolve = (value: { serverTime: Date; delayMs: number }) => {
            if (timeoutId !== null) clearTimeout(timeoutId);
            client.close();
            resolve(value);
        };

        const closeAndReject = (err: unknown) => {
            if (timeoutId !== null) clearTimeout(timeoutId);
            try { client.close(); } catch { /* already closed */ }
            reject(err);
        };

        client.on("message", (msg) => {
            const responseTime = Date.now();
            const delayMs = responseTime - requestTime;

            try {
                const packet = parseNtpPacket(msg);
                const serverTime = ntpToDate(packet.transmitTimestamp);
                closeAndResolve({ serverTime, delayMs });
            } catch (err) {
                closeAndReject(err);
            }
        });

        client.send(ntpData, NTP_PORT, server, (err) => {
            if (err) {
                closeAndReject(err);
            }
        });

        // Timeout after 5 seconds
        timeoutId = setTimeout(() => {
            timeoutId = null;
            closeAndReject(new Error("NTP query timeout"));
        }, 5000);
    });
}

/**
 * Try to sync with NTP servers
 * Returns the offset from system time, or null if all servers fail
 */
async function syncWithNtp(): Promise<{ offsetMs: number; source: "ntp" | "system" } | null> {
    for (const server of NTP_SERVERS) {
        try {
            const { serverTime, delayMs } = await queryNtpServer(server);
            const systemTime = new Date();
            // Adjust for network delay (assume symmetric)
            const adjustedServerTime = new Date(serverTime.getTime() + delayMs / 2);
            const offsetMs = adjustedServerTime.getTime() - systemTime.getTime();

            console.log(`NTP sync successful with ${server}: offset=${offsetMs}ms, delay=${delayMs}ms`);
            return { offsetMs, source: "ntp" };
        } catch (err) {
            console.warn(`NTP sync failed for ${server}:`, err);
        }
    }

    return null;
}

/**
 * Get current server time info
 * Uses cached offset if available and fresh, otherwise syncs with NTP
 */
export async function getServerTime(timezone: string = "Asia/Bangkok"): Promise<TimeInfo> {
    const now = new Date();

    // Check if we need to sync
    const needsSync = !cachedOffset ||
        (now.getTime() - cachedOffset.lastSyncAt.getTime()) > SYNC_INTERVAL_MS;

    if (needsSync) {
        const ntpResult = await syncWithNtp();

        if (ntpResult) {
            cachedOffset = {
                offsetMs: ntpResult.offsetMs,
                lastSyncAt: now,
                source: ntpResult.source,
            };
        } else {
            // Fallback to system time
            cachedOffset = {
                offsetMs: 0,
                lastSyncAt: now,
                source: "system",
            };
            console.warn("NTP sync failed, using system time");
        }
    }

    // Calculate server time based on offset
    const serverNow = new Date(now.getTime() + (cachedOffset?.offsetMs || 0));

    return {
        serverNow: serverNow.toISOString(),
        offsetMs: cachedOffset?.offsetMs || 0,
        source: cachedOffset?.source || "system",
        lastSyncAt: cachedOffset?.lastSyncAt.toISOString() || now.toISOString(),
        timezone,
    };
}

/**
 * Get current server time as Date object
 * Uses the cached offset for performance
 */
export function getCurrentServerTime(): Date {
    const now = new Date();
    const offsetMs = cachedOffset?.offsetMs || 0;
    return new Date(now.getTime() + offsetMs);
}

/**
 * Force a fresh NTP sync
 */
export async function forceNtpSync(): Promise<void> {
    cachedOffset = null;
    await getServerTime();
}

// Export types
export type { TimeInfo };
