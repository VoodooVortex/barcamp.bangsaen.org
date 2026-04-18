import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eventPhotos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { getEventYearBySlug } from "@/lib/db/queries";

export const revalidate = 60;

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const eventYear = await getEventYearBySlug(slug);
        if (!eventYear || !eventYear.published) {
            return NextResponse.json({ error: "Event year not found" }, { status: 404 });
        }

        const photos = await db.query.eventPhotos.findMany({
            where: eq(eventPhotos.eventYearId, eventYear.id),
            orderBy: asc(eventPhotos.order),
        });

        return NextResponse.json({ photos });
    } catch (error) {
        console.error("Failed to fetch public photos:", error);
        return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
    }
}
