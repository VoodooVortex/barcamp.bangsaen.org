// Admin venues API
// CRUD operations for venues (admin only)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { venues } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireEventManager } from "@/lib/auth/admin";
import { venueSchema } from "@/lib/validations/session";
import { broadcastScheduleUpdate } from "@/lib/socket/server";
import { handleApiError } from "@/lib/api/error-handler";
import { getEventYearBySlug } from "@/lib/db/queries";

// GET /api/admin/[slug]/venues
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

        const venuesList = await db.query.venues.findMany({
            where: eq(venues.eventYearId, eventYear.id),
            orderBy: asc(venues.order),
        });

        return NextResponse.json({ venues: venuesList });
    } catch (error) {
        return handleApiError(error, "Failed to fetch venues");
    }
}

// POST /api/admin/[slug]/venues
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
        return handleApiError(error, "Failed to create venue");
    }
}
