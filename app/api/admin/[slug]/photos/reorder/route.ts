import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { eventPhotos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireEventManager } from "@/lib/auth/admin";
import { handleApiError } from "@/lib/api/error-handler";
import { getEventYearBySlug } from "@/lib/db/queries";

const reorderSchema = z.object({
    orderedIds: z.array(z.string().uuid()),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const eventYear = await getEventYearBySlug(slug);
        if (!eventYear) {
            return NextResponse.json({ error: "Event year not found" }, { status: 404 });
        }

        await requireEventManager(eventYear);

        const body = await request.json();
        const validation = reorderSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { orderedIds } = validation.data;

        await db.transaction(async (tx) => {
            for (let i = 0; i < orderedIds.length; i++) {
                await tx
                    .update(eventPhotos)
                    .set({ order: i })
                    .where(eq(eventPhotos.id, orderedIds[i]));
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, "Failed to reorder photos");
    }
}
