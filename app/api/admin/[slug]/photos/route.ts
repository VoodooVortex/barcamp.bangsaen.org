import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventPhotos } from "@/lib/db/schema";
import { eq, asc, desc, sql } from "drizzle-orm";
import { requireEventManager } from "@/lib/auth/admin";
import { uploadEventPhoto } from "@/lib/supabase/storage";
import {
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE_BYTES,
} from "@/lib/validations/photo";
import { handleApiError } from "@/lib/api/error-handler";
import { getEventYearBySlug } from "@/lib/db/queries";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const eventYear = await getEventYearBySlug(slug);
        if (!eventYear) {
            return NextResponse.json({ error: "Event year not found" }, { status: 404 });
        }

        await requireEventManager(eventYear);

        const photos = await db.query.eventPhotos.findMany({
            where: eq(eventPhotos.eventYearId, eventYear.id),
            orderBy: asc(eventPhotos.order),
        });

        return NextResponse.json({ photos });
    } catch (error) {
        return handleApiError(error, "Failed to fetch photos");
    }
}

export async function POST(
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

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
                { status: 400 }
            );
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { imageUrl, storagePath } = await uploadEventPhoto(
            slug,
            buffer,
            file.name,
            file.type
        );

        // Auto-increment order: max existing order + 1.
        // Serialize per event year with an advisory lock so concurrent uploads
        // cannot read the same max and end up with a duplicate order.
        const newPhoto = await db.transaction(async (tx) => {
            await tx.execute(
                sql`select pg_advisory_xact_lock(hashtext(${eventYear.id}::text))`
            );

            const lastPhoto = await tx.query.eventPhotos.findFirst({
                where: eq(eventPhotos.eventYearId, eventYear.id),
                orderBy: desc(eventPhotos.order),
                columns: { order: true },
            });
            const nextOrder = lastPhoto ? lastPhoto.order + 1 : 0;

            const [photo] = await tx
                .insert(eventPhotos)
                .values({
                    eventYearId: eventYear.id,
                    imageUrl,
                    storagePath,
                    caption: null,
                    order: nextOrder,
                })
                .returning();

            return photo;
        });

        return NextResponse.json({ photo: newPhoto }, { status: 201 });
    } catch (error) {
        return handleApiError(error, "Failed to upload photo");
    }
}
