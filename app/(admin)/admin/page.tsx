// Admin root page - redirects to current year dashboard
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function AdminRootPage() {
  // 1. First, try to find the Active Year (isCurrentYear: true)
  const activeYear = await db.query.eventYears.findFirst({
    where: (years, { eq }) => eq(years.isCurrentYear, true),
  });

  if (activeYear) {
    redirect(`/admin/${activeYear.slug}/dashboard`);
  }

  // 2. Fall back to the most recent published year
  const latestYear = await db.query.eventYears.findFirst({
    where: (years, { eq }) => eq(years.published, true),
    orderBy: desc(eventYears.createdAt),
  });

  if (latestYear) {
    redirect(`/admin/${latestYear.slug}/dashboard`);
  }

  // 3. Fall back to any year at all
  const anyYear = await db.query.eventYears.findFirst({
    orderBy: desc(eventYears.createdAt),
  });

  if (anyYear) {
    redirect(`/admin/${anyYear.slug}/dashboard`);
  }

  // If no years exist at all
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">No Event Years Found</h1>
        <p className="text-muted-foreground">
          Please create an event year to get started.
        </p>
      </div>
    </div>
  );
}
