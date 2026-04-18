import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { eventSchema, validateEventDateRange } from "@/lib/validations/event";
import { handleApiError } from "@/lib/api/error-handler";

// GET /api/admin/events
export async function GET() {
    try {
        await requireAdmin();

        // Query all event years, sorted by slug
        const eventsList = await db.query.eventYears.findMany({
            orderBy: desc(eventYears.slug),
            // Optionally we can join with venues and sessions to get counts
            with: {
                venues: {
                    columns: { id: true }
                },
                sessions: {
                    columns: { id: true }
                }
            }
        });

        // Add counts to response
        const enhancedEvents = eventsList.map((event) => ({
            ...event,
            venueCount: event.venues.length,
            sessionCount: event.sessions.length,
            venues: undefined, // remove to keep payload small
            sessions: undefined,
        }));

        return NextResponse.json({ events: enhancedEvents });
    } catch (error) {
        return handleApiError(error, "Failed to fetch events");
    }
}

// POST /api/admin/events
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();

        const body = await request.json();
        const validation = eventSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Validate date range
        if (!validateEventDateRange(data.startDate, data.endDate)) {
            return NextResponse.json(
                { error: "Start date must be before or equal to end date" },
                { status: 400 }
            );
        }

        // Check for duplicate slug
        const existingEvent = await db.query.eventYears.findFirst({
            where: eq(eventYears.slug, data.slug),
        });

        if (existingEvent) {
            return NextResponse.json(
                { error: "Event with this slug already exists" },
                { status: 409 }
            );
        }

        // If setting this as current year, must unset other current years first
        if (data.isCurrentYear) {
            await db.update(eventYears)
                .set({ isCurrentYear: false })
                .where(eq(eventYears.isCurrentYear, true));
        }

        // Insert new event
        const [newEventYear] = await db
            .insert(eventYears)
            .values({
                slug: data.slug,
                name: data.name,
                year: data.year ?? null,
                edition: data.edition ?? null,
                location: data.location ?? null,
                ticketUrl: data.ticketUrl ?? null,
                ticketOpenDate: data.ticketOpenDate ? new Date(data.ticketOpenDate) : null,
                ticketCloseDate: data.ticketCloseDate ? new Date(data.ticketCloseDate) : null,
                timezone: data.timezone,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                published: data.published,
                isCurrentYear: data.isCurrentYear,
            })
            .returning();

        return NextResponse.json({ event: newEventYear }, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Failed to create event");
    }
}
