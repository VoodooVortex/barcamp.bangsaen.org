// Admin venue detail API
// Update and delete individual venues
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { venues, sessions } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { venueUpdateSchema } from "@/lib/validations/session";
import { broadcastScheduleUpdate } from "@/lib/socket/server";

// PATCH /api/admin/venues/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuthenticated();

        const { id } = await params;

        const existingVenue = await db.query.venues.findFirst({
            where: eq(venues.id, id),
            with: {
                eventYear: true,
            },
        });

        if (!existingVenue) {
            return NextResponse.json(
                { error: "Venue not found" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const validation = venueUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Check for duplicate name if name is being updated
        if (data.name && data.name !== existingVenue.name) {
            const duplicateVenue = await db.query.venues.findFirst({
                where: and(
                    eq(venues.eventYearId, existingVenue.eventYearId),
                    eq(venues.name, data.name),
                    ne(venues.id, id)
                ),
            });

            if (duplicateVenue) {
                return NextResponse.json(
                    { error: "Venue with this name already exists" },
                    { status: 409 }
                );
            }
        }

        const [updatedVenue] = await db
            .update(venues)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(venues.id, id))
            .returning();

        broadcastScheduleUpdate(existingVenue.eventYear.slug);

        return NextResponse.json({ venue: updatedVenue });
    } catch (error) {
        console.error("Error updating venue:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update venue" },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/venues/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuthenticated();

        const { id } = await params;

        const existingVenue = await db.query.venues.findFirst({
            where: eq(venues.id, id),
            with: {
                eventYear: true,
            },
        });

        if (!existingVenue) {
            return NextResponse.json(
                { error: "Venue not found" },
                { status: 404 }
            );
        }

        // Check if venue has sessions
        const venueSessions = await db.query.sessions.findMany({
            where: eq(sessions.venueId, id),
        });

        if (venueSessions.length > 0) {
            return NextResponse.json(
                { error: "Cannot delete venue with existing sessions" },
                { status: 409 }
            );
        }

        await db.delete(venues).where(eq(venues.id, id));

        broadcastScheduleUpdate(existingVenue.eventYear.slug);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting venue:", error);

        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { error: "Failed to delete venue" },
            { status: 500 }
        );
    }
}
