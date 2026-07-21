import { NextResponse } from "next/server";
import { db } from "@database/client";

export async function getHealthStatus() {
  try {
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      service: "feedbackflow",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: "feedbackflow",
        timestamp: new Date().toISOString(),
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}
