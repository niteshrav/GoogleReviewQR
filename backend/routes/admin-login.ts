import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  createOwnerSessionToken,
  hashAccessSecret,
  verifyAdminSecret,
} from "@backend/lib/auth/admin";
import { businessRepository } from "@database/index";
import { jsonError, noStoreHeaders } from "@backend/lib/http";
import { isSeededLoginSecret } from "@backend/lib/fixtures/seeded-login-credentials";

const loginSchema = z.object({
  secret: z.string().min(1),
  next: z.string().optional(),
});

export async function adminLogin(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid login payload", 400);
  }

  const secret = parsed.data.secret;
  const expected = process.env.ADMIN_SECRET;
  const isPrimary = Boolean(expected && secret === expected);
  const isSeeded = isSeededLoginSecret(secret);

  let cookieValue = secret;

  if (!isPrimary && !isSeeded) {
    const hashed = hashAccessSecret(secret);
    const business =
      (await businessRepository.findByOwnerAccessSecret(hashed)) ??
      (await businessRepository.findByOwnerAccessSecret(secret));

    if (!business) {
      return jsonError("Invalid admin secret", 401);
    }

    const sessionToken = createOwnerSessionToken();
    await businessRepository.update(business.id, { ownerSessionToken: sessionToken });
    cookieValue = sessionToken;
  } else if (!(await verifyAdminSecret(secret))) {
    return jsonError("Invalid admin secret", 401);
  }

  const nextPath =
    parsed.data.next && parsed.data.next.startsWith("/admin") ? parsed.data.next : "/admin";

  const response = NextResponse.json({ ok: true, next: nextPath }, { headers: noStoreHeaders() });

  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}

export async function adminLogout() {
  const response = NextResponse.json({ ok: true }, { headers: noStoreHeaders() });
  response.cookies.delete(ADMIN_SESSION_COOKIE);
  return response;
}
