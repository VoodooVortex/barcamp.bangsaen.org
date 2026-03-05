// Admin session detail API
// Update and delete individual sessions
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { sessionUpdateSchema, validateTimeRange, sessionsOverlap } from "@/lib/validations/session";
import { broadcastScheduleUpdate } from "@/lib/socket/server";

// PATCH /api/admin/sessions/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuthenticated();

        const { id } = await params;

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

        const body = await request.json();
        const validation = sessionUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Validate time range if both are provided
        const startAt = data.startAt ? new Date(data.startAt) : new Date(existingSession.startAt);
        const endAt = data.endAt ? new Date(data.endAt) : new Date(existingSession.endAt);

        if (data.startAt || data.endAt) {
            if (!validateTimeRange(startAt.toISOString(), endAt.toISOString())) {
                return NextResponse.json(
                    { error: "Start time must be before end time" },
                    { status: 400 }
                );
            }
        }

        // Check for overlapping sessions only if venue or time actually changed
        const venueId = data.venueId || existingSession.venueId;

        const startAtChanged = data.startAt &&
            new Date(data.startAt).getTime() !== new Date(existingSession.startAt).getTime();
        const endAtChanged = data.endAt &&
            new Date(data.endAt).getTime() !== new Date(existingSession.endAt).getTime();
        const venueChanged = data.venueId && data.venueId !== existingSession.venueId;

        if (venueChanged || startAtChanged || endAtChanged) {
            const otherSessions = await db.query.sessions.findMany({
                where: and(
                    eq(sessions.venueId, venueId),
                    eq(sessions.eventYearId, existingSession.eventYearId),
                    ne(sessions.id, id)
                ),
            });

            const hasOverlap = otherSessions.some((session) =>
                sessionsOverlap(
                    startAt,
                    endAt,
                    new Date(session.startAt),
                    new Date(session.endAt)
                )
            );

            if (hasOverlap) {
                return NextResponse.json(
                    { error: "Session overlaps with an existing session in this venue" },
                    { status: 409 }
                );
            }
        }

        // Update session
        const [updatedSession] = await db
            .update(sessions)
            .set({
                ...data,
                startAt: data.startAt ? new Date(data.startAt) : undefined,
                endAt: data.endAt ? new Date(data.endAt) : undefined,
                updatedAt: new Date(),
            })
            .where(eq(sessions.id, id))
            .returning();

        // Broadcast update
        broadcastScheduleUpdate(existingSession.eventYear.slug);

        return NextResponse.json({ session: updatedSession });
    } catch (error) {
        console.error("Error updating session:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update session" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/sessions/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuthenticated();

        const { id } = await params;

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

        await db.delete(sessions).where(eq(sessions.id, id));

        // Broadcast update
        broadcastScheduleUpdate(existingSession.eventYear.slug);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting session:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete session" },
            { status: 500 }
        );
    }
}
