import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, ROLES } from "@/lib/db/schema";
import { and, count, eq, ne, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { handleApiError } from "@/lib/api/error-handler";
import { z } from "zod";

const updateSchema = z.object({
    role: z.enum(ROLES).optional(),
    isActive: z.boolean().optional(),
});

/**
 * Admins may not change or remove their own whitelist row: demoting or deleting
 * yourself is the only way to drop the system to zero admins and lock everyone
 * out (any other target leaves the caller as an admin).
 */
async function guardSelfMutation(id: string, currentEmail: string) {
    const target = await db.query.adminUsers.findFirst({
        where: eq(adminUsers.id, id),
        columns: { email: true },
    });

    if (!target) {
        return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
    }

    if (target.email === currentEmail) {
        return {
            error: NextResponse.json(
                {
                    error: "Cannot modify your own admin account",
                    details: "Ask another admin to change or remove your access.",
                },
                { status: 400 }
            ),
        };
    }

    return { error: null };
}

// Serializes admin_users mutations so two admins cannot concurrently remove
// each other and leave the system with zero admins.
const ADMIN_USERS_LOCK_KEY = 8471;

async function wouldLeaveNoAdmin(
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    targetId: string
) {
    const [{ others }] = await tx
        .select({ others: count() })
        .from(adminUsers)
        .where(
            and(
                eq(adminUsers.role, "admin"),
                eq(adminUsers.isActive, true),
                ne(adminUsers.id, targetId)
            )
        );

    return others === 0;
}

const lockoutResponse = () =>
    NextResponse.json(
        {
            error: "Cannot remove the last admin",
            details: "Promote another user to admin first.",
        },
        { status: 400 }
    );

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await requireAdmin();
        const { id } = await params;

        const guard = await guardSelfMutation(id, currentUser.email);
        if (guard.error) return guard.error;

        const body = await request.json();
        const validation = updateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        // Only a change that strips admin access can lock the system out
        const demotes =
            (validation.data.role !== undefined && validation.data.role !== "admin") ||
            validation.data.isActive === false;

        const updated = await db.transaction(async (tx) => {
            await tx.execute(sql`select pg_advisory_xact_lock(${ADMIN_USERS_LOCK_KEY})`);

            if (demotes && (await wouldLeaveNoAdmin(tx, id))) {
                return "lockout" as const;
            }

            const [user] = await tx
                .update(adminUsers)
                .set({ ...validation.data, updatedAt: new Date() })
                .where(eq(adminUsers.id, id))
                .returning();

            return user;
        });

        if (updated === "lockout") {
            return lockoutResponse();
        }

        if (!updated) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: updated });
    } catch (error) {
        return handleApiError(error, "Failed to update user");
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await requireAdmin();
        const { id } = await params;

        const guard = await guardSelfMutation(id, currentUser.email);
        if (guard.error) return guard.error;

        const deleted = await db.transaction(async (tx) => {
            await tx.execute(sql`select pg_advisory_xact_lock(${ADMIN_USERS_LOCK_KEY})`);

            if (await wouldLeaveNoAdmin(tx, id)) {
                return "lockout" as const;
            }

            const [user] = await tx
                .delete(adminUsers)
                .where(eq(adminUsers.id, id))
                .returning();

            return user;
        });

        if (deleted === "lockout") {
            return lockoutResponse();
        }

        if (!deleted) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, "Failed to delete user");
    }
}
