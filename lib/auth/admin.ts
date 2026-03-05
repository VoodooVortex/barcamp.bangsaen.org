// Admin authentication utilities
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.isAdmin ?? false;
}

/**
 * Require admin access, throw error if not admin
 */
export async function requireAdmin(): Promise<void> {
    const admin = await isAdmin();
    if (!admin) {
        throw new Error("Unauthorized: Admin access required");
    }
}

/**
 * Require authenticated access, throw error if no active user session
 */
export async function requireAuthenticated(): Promise<void> {
    const user = await getCurrentUser();

    if (!user || !user.isWhitelisted) {
        throw new Error("Unauthorized: Authentication and whitelist required");
    }
}

/**
 * Get current user with admin / whitelist check
 */
export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
        return null;
    }

    try {
        // Query the database to check if user is whitelisted
        const [dbUser] = await db
            .select()
            .from(adminUsers)
            .where(eq(adminUsers.email, user.email))
            .limit(1);

        const isWhitelisted = !!dbUser && dbUser.isActive;
        const dbRole = dbUser?.role || "user";
        const isAdminUser = isWhitelisted && dbRole === "admin";

        return {
            id: user.id,
            email: user.email,
            role: dbRole,
            isAdmin: isAdminUser,
            isStaff: isWhitelisted && dbRole === "staff",
            isWhitelisted,
        };
    } catch (dbError) {
        console.error("Database query for admin_users failed:", dbError);
        return null;
    }
}
