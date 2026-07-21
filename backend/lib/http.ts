import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function noStoreHeaders(): HeadersInit {
  return {
    "Cache-Control": "no-store, max-age=0",
  };
}
