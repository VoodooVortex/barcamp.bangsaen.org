// Session control API - Start/End sessions manually
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { broadcastScheduleUpdate } from "@/lib/socket/server";

// POST /api/admin/sessions/[id]/control
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuthenticated();

        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        if (!["start", "end", "reset"].includes(action)) {
            return NextResponse.json(
                { error: "Invalid action. Must be 'start', 'end', or 'reset'" },
                { status: 400 }
            );
        }

        const existingSession = await db.query.sessions.findFirst({
            where: eq(sessions.id, id),
            with: {
                eventYear: true,
            },
        });

        if (!existingSession) {
            return NextResponse.json(
                { error: "Session not found" },
                { status: 404 }
            );
        }

        const now = new Date();
        const updateData: Record<string, unknown> = { updatedAt: now };

        switch (action) {
            case "start":
                if (existingSession.actualStartAt) {
                    return NextResponse.json(
                        { error: "Session has already been started" },
                        { status: 400 }
                    );
                }
                updateData.actualStartAt = now;
                break;

            case "end":
                if (existingSession.actualEndAt) {
                    return NextResponse.json(
                        { error: "Session has already been ended" },
                        { status: 400 }
                    );
                }
                // Auto-start if not started yet
                if (!existingSession.actualStartAt) {
                    updateData.actualStartAt = now;
                }
                updateData.actualEndAt = now;
                break;

            case "reset":
                updateData.actualStartAt = null;
                updateData.actualEndAt = null;
                break;
        }

        const [updatedSession] = await db
            .update(sessions)
            .set(updateData)
            .where(eq(sessions.id, id))
            .returning();

        // Broadcast to live viewers
        broadcastScheduleUpdate(existingSession.eventYear.slug);

        return NextResponse.json({
            session: updatedSession,
            action,
            message: `Session ${action === "reset" ? "reset" : action + "ed"} successfully`,
        });
    } catch (error) {
        console.error("Error controlling session:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to control session" },
            { status: 500 }
        );
    }
}
