// Admin authentication utilities
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import type { EventYear } from "@/lib/db/schema";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/**
 * Require admin access, throw error if not admin
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();
    if (!user?.isAdmin) {
        throw new Error("Unauthorized: Admin access required");
    }
    return user;
}

async function requireWhitelistedUser(): Promise<AuthenticatedUser> {
    const user = await getCurrentUser();

    if (!user || !user.isWhitelisted) {
        throw new Error("Unauthorized: Authentication and whitelist required");
    }

    return user;
}

/**
 * Require authenticated access, throw error if no active user session
 */
export async function requireAuthenticated(): Promise<void> {
    await requireWhitelistedUser();
}

export async function requireEventManager(
    eventYear: Pick<EventYear, "isCurrentYear">
): Promise<AuthenticatedUser> {
    const user = await requireWhitelistedUser();

    if (user.isAdmin) {
        return user;
    }

    if (user.isStaff && eventYear.isCurrentYear) {
        return user;
    }

    throw new Error("Unauthorized: Admin or current-year staff access required");
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
