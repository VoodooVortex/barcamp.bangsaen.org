// Public schedule API
// Returns all published sessions and venues for a specific year
import { NextRequest, NextResponse } from "next/server";
import {
  buildLiveScheduleData,
  getPublishedLiveEventYear,
} from "@/lib/public-live-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Invalid slug parameter" }, { status: 400 });
    }

    const eventYear = await getPublishedLiveEventYear(slug);

    if (!eventYear) {
      return NextResponse.json({ error: "Event year not found" }, { status: 404 });
    }

    const schedule = await buildLiveScheduleData(eventYear);

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
