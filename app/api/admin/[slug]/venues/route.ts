// Admin venues API
// CRUD operations for venues (admin only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { venues, eventYears } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { venueSchema } from "@/lib/validations/session";
import { broadcastScheduleUpdate } from "@/lib/socket/server";

// GET /api/admin/[slug]/venues
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

        const venuesList = await db.query.venues.findMany({
            where: eq(venues.eventYearId, eventYear.id),
            orderBy: asc(venues.order),
        });

        return NextResponse.json({ venues: venuesList });
    } catch (error) {
        console.error("Error fetching venues:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch venues" },
            { status: 500 }
        );
    }
}

// POST /api/admin/[slug]/venues
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
        const validation = venueSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Check for duplicate name
        const existingVenue = await db.query.venues.findFirst({
            where: and(
                eq(venues.eventYearId, eventYear.id),
                eq(venues.name, data.name)
            ),
        });

        if (existingVenue) {
            return NextResponse.json(
                { error: "Venue with this name already exists" },
                { status: 409 }
            );
        }

        const [newVenue] = await db
            .insert(venues)
            .values({
                ...data,
                eventYearId: eventYear.id,
            })
            .returning();

        broadcastScheduleUpdate(slug);

        return NextResponse.json({ venue: newVenue }, { status: 201 });
    } catch (error) {
        console.error("Error creating venue:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create venue" },
            { status: 500 }
        );
    }
}
