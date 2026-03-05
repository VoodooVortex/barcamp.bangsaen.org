// Server time API endpoint
// Returns NTP-synchronized server time
import { NextResponse } from "next/server";
import { getServerTime } from "@/lib/time/ntp";

export async function GET() {
    try {
        const timeInfo = await getServerTime("Asia/Bangkok");

        return NextResponse.json(timeInfo, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (error) {
        console.error("Error getting server time:", error);

        // Fallback to system time
        return NextResponse.json(
            {
                serverNow: new Date().toISOString(),
                offsetMs: 0,
                source: "system",
                lastSyncAt: new Date().toISOString(),
                timezone: "Asia/Bangkok",
            },
            { status: 200 }
        );
    }
}
