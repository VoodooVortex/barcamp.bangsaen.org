import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventPhotos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireEventManager } from "@/lib/auth/admin";
import { deleteEventPhoto } from "@/lib/supabase/storage";

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const existingPhoto = await db.query.eventPhotos.findFirst({
            where: eq(eventPhotos.id, id),
            with: { eventYear: true },
        });
        if (!existingPhoto) {
            return NextResponse.json({ error: "Photo not found" }, { status: 404 });
        }

        await requireEventManager(existingPhoto.eventYear);

        // Delete from storage first — if this fails, the DB row is preserved for retry
        await deleteEventPhoto(existingPhoto.storagePath);

        await db.delete(eventPhotos).where(eq(eventPhotos.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.error("Failed to delete photo:", error);
        return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }
}
