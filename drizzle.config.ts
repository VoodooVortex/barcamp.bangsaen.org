import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL is missing. Set it in .env or .env.local before running Drizzle commands.",
    );
}

export default defineConfig({
    schema: "./lib/db/schema.ts",
    out: "./lib/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: databaseUrl,
    },
});
