import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { eventUpdateSchema, validateEventDateRange } from "@/lib/validations/event";

// PATCH /api/admin/events/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuthenticated();

        const { id } = await params;

        // Check if event exists
        const existingEvent = await db.query.eventYears.findFirst({
            where: eq(eventYears.id, id),
        });

        if (!existingEvent) {
            return NextResponse.json(
                { error: "Event year not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validation = eventUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Validate date range if both dates are provided or mixed with existing
        const newStartDate = data.startDate !== undefined ? data.startDate : existingEvent.startDate?.toISOString();
        const newEndDate = data.endDate !== undefined ? data.endDate : existingEvent.endDate?.toISOString();

        if (!validateEventDateRange(newStartDate, newEndDate)) {
            return NextResponse.json(
                { error: "Start date must be before or equal to end date" },
                { status: 400 }
            );
        }

        // If setting this as current year, unset other current years first
        if (data.isCurrentYear && !existingEvent.isCurrentYear) {
            await db.update(eventYears)
                .set({ isCurrentYear: false })
                .where(eq(eventYears.isCurrentYear, true));
        }

        // Remove undefined values
        const updateData: Record<string, unknown> = {};
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.name !== undefined) updateData.name = data.name;
        if (data.year !== undefined) updateData.year = data.year;
        if (data.location !== undefined) updateData.location = data.location;
        if (data.timezone !== undefined) updateData.timezone = data.timezone;
        if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
        if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        if (data.published !== undefined) updateData.published = data.published;
        if (data.isCurrentYear !== undefined) updateData.isCurrentYear = data.isCurrentYear;

        // Add updatedAt if editing
        if (Object.keys(updateData).length > 0) {
            updateData.updatedAt = new Date();
        }

        const [updatedEvent] = await db
            .update(eventYears)
            .set(updateData)
            .where(eq(eventYears.id, id))
            .returning();

        return NextResponse.json({ event: updatedEvent });
    } catch (error) {
        console.error("Error updating event year:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update event year" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/events/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuthenticated();

        const { id } = await params;

        // Check if event exists
        const existingEvent = await db.query.eventYears.findFirst({
            where: eq(eventYears.id, id),
            with: {
                sessions: { limit: 1 },
                venues: { limit: 1 },
            }
        });

        if (!existingEvent) {
            return NextResponse.json(
                { error: "Event year not found" },
                { status: 404 }
            );
        }

        // Prevent delete if it has venues or sessions
        if (existingEvent.sessions.length > 0 || existingEvent.venues.length > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete event year that has sessions or venues.",
                    details: "Please delete all associated sessions and venues first."
                },
                { status: 400 }
            );
        }

        // Cannot delete if it is current year
        if (existingEvent.isCurrentYear) {
            return NextResponse.json(
                {
                    error: "Cannot delete the active year.",
                    details: "Please assign another year as the active year first."
                },
                { status: 400 }
            );
        }

        await db.delete(eventYears).where(eq(eventYears.id, id));

        return NextResponse.json({ success: true, message: "Event year deleted" });
    } catch (error) {
        console.error("Error deleting event year:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete event year" },
            { status: 500 }
        );
    }
}
