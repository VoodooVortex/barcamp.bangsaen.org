import { db } from "./index";
import { eventYears } from "./schema";
import { eq } from "drizzle-orm";

export function getEventYearBySlug(slug: string) {
  return db.query.eventYears.findFirst({
    where: eq(eventYears.slug, slug),
  });
}
