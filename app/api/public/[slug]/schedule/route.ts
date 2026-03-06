// Public schedule API
// Returns all published sessions and venues for a specific year
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventYears, venues, sessions } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

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

        if (!eventYear.published) {
            return NextResponse.json(
                { error: "Event year not published" },
                { status: 404 }
            );
        }

        // Get venues
        const venuesList = await db.query.venues.findMany({
            where: and(
                eq(venues.eventYearId, eventYear.id),
                eq(venues.isActive, true)
            ),
            orderBy: asc(venues.order),
        });

        // Get published sessions
        const sessionsList = await db.query.sessions.findMany({
            where: and(
                eq(sessions.eventYearId, eventYear.id),
                eq(sessions.isPublished, true)
            ),
            with: {
                venue: true,
            },
            orderBy: asc(sessions.startAt),
        });

        return NextResponse.json({
            eventYear: {
                id: eventYear.id,
                slug: eventYear.slug,
                name: eventYear.name,
                location: eventYear.location ?? null,
                timezone: eventYear.timezone,
                startDate: eventYear.startDate,
                endDate: eventYear.endDate,
            },
            venues: venuesList,
            sessions: sessionsList.map((session) => ({
                id: session.id,
                title: session.title,
                description: session.description,
                speakerName: session.speakerName,
                speakerBio: session.speakerBio,
                startAt: session.startAt,
                endAt: session.endAt,
                actualStartAt: session.actualStartAt,
                actualEndAt: session.actualEndAt,
                tags: session.tags,
                livestreamUrl: session.livestreamUrl,
                venueId: session.venueId,
                venue: session.venue,
            })),
        });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return NextResponse.json(
            { error: "Failed to fetch schedule" },
            { status: 500 }
        );
    }
}
