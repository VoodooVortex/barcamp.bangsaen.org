import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { eventPhotos, eventYears } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireEventManager } from "@/lib/auth/admin";

const reorderSchema = z.object({
    orderedIds: z.array(z.string().uuid()),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const eventYear = await db.query.eventYears.findFirst({
            where: eq(eventYears.slug, slug),
        });
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
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("Failed to reorder photos:", error);
        return NextResponse.json({ error: "Failed to reorder photos" }, { status: 500 });
    }
}
