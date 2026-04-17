import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eventYears } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function AdminPhotosAliasPage() {
  const latestYear = await db.query.eventYears.findFirst({
    where: (years, { eq }) => eq(years.published, true),
    orderBy: desc(eventYears.createdAt),
  });

  if (latestYear) {
    redirect(`/admin/${latestYear.slug}/photos`);
  }

  const anyYear = await db.query.eventYears.findFirst({
    orderBy: desc(eventYears.createdAt),
  });

  if (anyYear) {
    redirect(`/admin/${anyYear.slug}/photos`);
  }

  redirect("/admin");
}
