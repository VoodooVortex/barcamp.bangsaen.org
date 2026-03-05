// Admin sessions API
// CRUD operations for sessions (admin only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, eventYears } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { sessionSchema, validateTimeRange, sessionsOverlap } from "@/lib/validations/session";
import { broadcastScheduleUpdate } from "@/lib/socket/server";

// GET /api/admin/[slug]/sessions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await requireAuthenticated();

        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: "Invalid slug parameter" },
                { status: 400 }
            );
        }

        const eventYear = await db.query.eventYears.findFirst({
            where: eq(eventYears.slug, slug),
        });

        if (!eventYear) {
            return NextResponse.json(
                { error: "Event year not found" },
                { status: 404 }
            );
        }

        const sessionsList = await db.query.sessions.findMany({
            where: eq(sessions.eventYearId, eventYear.id),
            with: {
                venue: true,
            },
            orderBy: asc(sessions.startAt),
        });

        return NextResponse.json({ sessions: sessionsList });
    } catch (error) {
        console.error("Error fetching sessions:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch sessions" },
            { status: 500 }
        );
    }
}

// POST /api/admin/[slug]/sessions
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await requireAuthenticated();

        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: "Invalid slug parameter" },
                { status: 400 }
            );
        }

        const eventYear = await db.query.eventYears.findFirst({
            where: eq(eventYears.slug, slug),
        });

        if (!eventYear) {
            return NextResponse.json(
                { error: "Event year not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validation = sessionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Validate time range
        if (!validateTimeRange(data.startAt, data.endAt)) {
            return NextResponse.json(
                { error: "Start time must be before end time" },
                { status: 400 }
            );
        }

        // Check for overlapping sessions in the same venue
        const startAt = new Date(data.startAt);
        const endAt = new Date(data.endAt);

        const existingSessions = await db.query.sessions.findMany({
            where: and(
                eq(sessions.venueId, data.venueId),
                eq(sessions.eventYearId, eventYear.id)
            ),
        });

        const hasOverlap = existingSessions.some((session) =>
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

        // Create session
        const [newSession] = await db
            .insert(sessions)
            .values({
                ...data,
                eventYearId: eventYear.id,
                startAt: new Date(data.startAt),
                endAt: new Date(data.endAt),
            })
            .returning();

        // Broadcast update to connected clients
        broadcastScheduleUpdate(slug);

        return NextResponse.json({ session: newSession }, { status: 201 });
    } catch (error) {
        console.error("Error creating session:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create session" },
            { status: 500 }
        );
    }
}
