// Socket.io initialization route
// This is used to initialize the Socket.io server
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        message: "Socket.io server is running",
        status: "ok",
    });
}
