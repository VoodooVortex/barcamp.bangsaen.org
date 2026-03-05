import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { z } from "zod";

const userSchema = z.object({
    email: z.string().email(),
    role: z.enum(["admin", "staff"]),
    isActive: z.boolean().default(true),
});

export async function GET() {
    try {
        await requireAdmin();
        const users = await db.query.adminUsers.findMany({
            orderBy: desc(adminUsers.createdAt),
        });
        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const validation = userSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const existingUser = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.email, validation.data.email),
        });

        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
        }

        const [newUser] = await db
            .insert(adminUsers)
            .values(validation.data)
            .returning();

        return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
