// Public status API
// Returns current "On Air" and "Up Next" sessions
import { NextRequest, NextResponse } from "next/server";
import { getCurrentServerTime } from "@/lib/time/ntp";
import {
  buildLiveStatusData,
  getPublishedLiveEventYear,
} from "@/lib/public-live-data";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const atParam = searchParams.get("at");

    if (!slug) {
      return NextResponse.json({ error: "Invalid slug parameter" }, { status: 400 });
    }

    const eventYear = await getPublishedLiveEventYear(slug);

    if (!eventYear) {
      return NextResponse.json({ error: "Event year not found" }, { status: 404 });
    }

    const now = atParam ? new Date(atParam) : getCurrentServerTime();
    const status = await buildLiveStatusData(eventYear, now);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
