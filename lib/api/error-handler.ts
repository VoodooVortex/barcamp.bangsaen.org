import { NextResponse } from "next/server";

export function handleApiError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage, error);

  if (error instanceof Error && error.message.includes("Unauthorized")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ error: defaultMessage }, { status: 500 });
}
