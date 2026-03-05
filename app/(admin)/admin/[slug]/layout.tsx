// Year-specific admin layout
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Calendar, MapPin } from "lucide-react";
import { YearSwitcher } from "@/components/admin/year-switcher";

interface YearLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function YearLayout({
  children,
  params,
}: YearLayoutProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const eventYear = await db.query.eventYears.findFirst({
    where: eq(eventYears.slug, slug),
  });

  if (!eventYear) {
    notFound();
  }

  // Get all years for the selector
  const allYears = await db.query.eventYears.findMany({
    orderBy: desc(eventYears.createdAt),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{eventYear.name}</h1>
          <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            Managing event {eventYear.slug}
          </p>
          {eventYear.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              <MapPin className="h-4 w-4" />
              {eventYear.location}
            </p>
          )}
        </div>

        {/* Year selector */}
        <YearSwitcher years={allYears} currentSlug={slug} />
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
