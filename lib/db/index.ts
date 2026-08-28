import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL is missing. Set it in .env or .env.local before running DB scripts.",
    );
}

// Connection pool.
// DATABASE_URL points at the Supabase pooler (pgbouncer), and on serverless every
// instance opens its own pool, so keep `max` small: an instance handles very few
// concurrent requests, and a large cap here multiplies across instances until the
// pooler runs out of client slots.
function createPool() {
    const pool = new Pool({
        connectionString: databaseUrl,
        max: 5,
        idleTimeoutMillis: 10000, // release idle connections quickly on serverless
        connectionTimeoutMillis: 10000,
        statement_timeout: 30000, // 30 seconds query timeout
        query_timeout: 30000,
        // Retry failed connections
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
    });

    // Handle pool errors to prevent crashes
    pool.on("error", (err) => {
        console.error("Unexpected database pool error:", err);
        // Don't exit - let the app try to recover
    });

    return pool;
}

// Reuse one pool across dev hot reloads, which would otherwise leak a pool per reload
const globalForDb = globalThis as typeof globalThis & { __dbPool?: Pool };
const pool = globalForDb.__dbPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
    globalForDb.__dbPool = pool;
}

// Create Drizzle client
export const db = drizzle(pool, { schema });

// Export a retry wrapper for queries
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            console.warn(`Database operation failed (attempt ${i + 1}/${maxRetries}):`, error);

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
            }
        }
    }

    throw lastError;
}

// Export schema for use in queries
export * from "./schema";
