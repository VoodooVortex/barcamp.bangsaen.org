import { db } from "@/lib/db";
import { eventPhotos } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuthenticated } from "@/lib/auth/admin";
import { notFound, redirect } from "next/navigation";
import { getEventYearBySlug } from "@/lib/db/queries";
import PhotosClient from "./photos-client";

interface PhotosPageProps {
    params: Promise<{ slug: string }>;
}

export default async function PhotosPage({ params }: PhotosPageProps) {
    try {
        await requireAuthenticated();
    } catch {
        redirect("/auth/login");
    }

    const { slug } = await params;
    if (!slug) notFound();

    const eventYear = await getEventYearBySlug(slug);
    if (!eventYear) notFound();

    const photosList = await db.query.eventPhotos.findMany({
        where: eq(eventPhotos.eventYearId, eventYear.id),
        orderBy: asc(eventPhotos.order),
    });

    const serializedPhotos = photosList.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
    }));

    return <PhotosClient initialPhotos={serializedPhotos} slug={slug} />;
}
