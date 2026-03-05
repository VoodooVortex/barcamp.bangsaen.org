import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { z } from "zod";

const updateSchema = z.object({
    role: z.enum(["admin", "staff"]).optional(),
    isActive: z.boolean().optional(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const body = await request.json();
        const validation = updateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const [updated] = await db
            .update(adminUsers)
            .set({ ...validation.data, updatedAt: new Date() })
            .where(eq(adminUsers.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: updated });
    } catch (error) {
        console.error("Error updating user:", error);
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;

        const [deleted] = await db
            .delete(adminUsers)
            .where(eq(adminUsers.id, id))
            .returning();

        if (!deleted) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
