// Admin sessions API
// CRUD operations for sessions (admin only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, venues } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireEventManager } from "@/lib/auth/admin";
import { sessionSchema, validateTimeRange, sessionsOverlap } from "@/lib/validations/session";
import { broadcastScheduleUpdate } from "@/lib/socket/server";
import { handleApiError } from "@/lib/api/error-handler";
import { getEventYearBySlug } from "@/lib/db/queries";

// GET /api/admin/[slug]/sessions
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: "Invalid slug parameter" },
                { status: 400 }
            );
        }

        const eventYear = await getEventYearBySlug(slug);

        if (!eventYear) {
            return NextResponse.json(
                { error: "Event year not found" },
                { status: 404 }
            );
        }

        await requireEventManager(eventYear);

        const sessionsList = await db.query.sessions.findMany({
            where: eq(sessions.eventYearId, eventYear.id),
            with: {
                venue: true,
            },
            orderBy: asc(sessions.startAt),
        });

        return NextResponse.json({ sessions: sessionsList });
    } catch (error) {
        return handleApiError(error, "Failed to fetch sessions");
    }
}

// POST /api/admin/[slug]/sessions
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json(
                { error: "Invalid slug parameter" },
                { status: 400 }
            );
        }

        const eventYear = await getEventYearBySlug(slug);

        if (!eventYear) {
            return NextResponse.json(
                { error: "Event year not found" },
                { status: 404 }
            );
        }

        await requireEventManager(eventYear);

        const body = await request.json();
        const validation = sessionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        const selectedVenue = await db.query.venues.findFirst({
            where: and(
                eq(venues.id, data.venueId),
                eq(venues.eventYearId, eventYear.id)
            ),
        });

        if (!selectedVenue) {
            return NextResponse.json(
                { error: "Venue does not belong to this event year" },
                { status: 400 }
            );
        }

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
        return handleApiError(error, "Failed to create session");
    }
}
