// Public status API
// Returns current "On Air" and "Up Next" sessions
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventYears, venues, sessions } from "@/lib/db/schema";
import { eq, and, asc, gt, lte } from "drizzle-orm";
import { getCurrentServerTime } from "@/lib/time/ntp";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const atParam = searchParams.get("at");

        if (!slug) {
            return NextResponse.json(
                { error: "Invalid slug parameter" },
                { status: 400 }
            );
        }

        // Get event year
        const eventYear = await db.query.eventYears.findFirst({
            where: eq(eventYears.slug, slug),
        });

        if (!eventYear) {
            return NextResponse.json(
                { error: "Event year not found" },
                { status: 404 }
            );
        }

        const now = atParam ? new Date(atParam) : getCurrentServerTime();

        // Get active venues
        const venuesList = await db.query.venues.findMany({
            where: and(
                eq(venues.eventYearId, eventYear.id),
                eq(venues.isActive, true)
            ),
            orderBy: asc(venues.order),
        });

        // Get all published sessions for the day
        // Use endAt > now instead of startAt >= startOfDay so that sessions
        // which started before local midnight but are still running are included.
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const allSessions = await db.query.sessions.findMany({
            where: and(
                eq(sessions.eventYearId, eventYear.id),
                eq(sessions.isPublished, true),
                gt(sessions.endAt, now),
                lte(sessions.startAt, endOfDay)
            ),
            with: {
                venue: true,
            },
            orderBy: asc(sessions.startAt),
        });

        // Calculate On Air sessions
        // A session is on-air if:
        //   - It has actualStartAt and no actualEndAt (manually started, not ended)
        //   - OR it has no actualStartAt, scheduled startAt <= now, and endAt > now (auto by schedule)
        // A session is NOT on-air if it has actualEndAt (manually ended)
        const onAir = allSessions.filter((session) => {
            if (session.actualEndAt) return false; // Manually ended
            if (session.actualStartAt) return true; // Manually started, not ended
            // Auto by schedule
            return new Date(session.startAt) <= now && new Date(session.endAt) > now;
        });

        // Calculate Up Next sessions (all sessions that haven't started yet)
        const upNext = allSessions.filter(
            (s) => !s.actualStartAt && !s.actualEndAt && new Date(s.startAt) > now
        );

        return NextResponse.json({
            serverTime: now.toISOString(),
            timezone: eventYear.timezone,
            onAir: onAir.map((session) => ({
                id: session.id,
                title: session.title,
                speakerName: session.speakerName,
                startAt: session.startAt,
                endAt: session.endAt,
                actualStartAt: session.actualStartAt,
                actualEndAt: session.actualEndAt,
                tags: session.tags,
                livestreamUrl: session.livestreamUrl,
                venue: session.venue,
                progress: calculateProgress(
                    session.actualStartAt || session.startAt,
                    session.endAt,
                    now
                ),
            })),
            upNext: upNext.map((session) => ({
                id: session.id,
                title: session.title,
                speakerName: session.speakerName,
                startAt: session.startAt,
                endAt: session.endAt,
                tags: session.tags,
                venue: session.venue,
                startsIn: calculateTimeUntil(session.startAt, now),
            })),
        });
    } catch (error) {
        console.error("Error fetching status:", error);
        return NextResponse.json(
            { error: "Failed to fetch status" },
            { status: 500 }
        );
    }
}

function calculateProgress(startAt: Date | string, endAt: Date | string, now: Date): number {
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    const current = now.getTime();

    if (current <= start) return 0;
    if (current >= end) return 100;

    return Math.round(((current - start) / (end - start)) * 100);
}

function calculateTimeUntil(startAt: Date | string, now: Date): string {
    const start = new Date(startAt).getTime();
    const current = now.getTime();
    const diffMs = start - current;

    if (diffMs <= 0) return "Starting now";

    const diffMins = Math.ceil(diffMs / 60000);

    if (diffMins < 60) {
        return `in ${diffMins} min`;
    }

    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;

    if (remainingMins === 0) {
        return `in ${diffHours} hr`;
    }

    return `in ${diffHours} hr ${remainingMins} min`;
}
