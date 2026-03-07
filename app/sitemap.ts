import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://barcamp.bangsaen.org";

  let livePages: MetadataRoute.Sitemap = [];

  try {
    // Get all published years for dynamic routes
    const publishedYears = await db.query.eventYears.findMany({
      where: eq(eventYears.published, true),
      orderBy: desc(eventYears.createdAt),
    });

    livePages = publishedYears.map((year) => ({
      url: `${baseUrl}/live/${year.slug}`,
      lastModified: year.updatedAt,
      changeFrequency: "always" as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Failed to fetch event years for sitemap:", error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...livePages,
  ];
}
