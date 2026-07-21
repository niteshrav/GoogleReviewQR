import { timingSafeEqual } from "crypto";
import { isSeededLoginSecret } from "@backend/lib/fixtures/seeded-login-credentials";

export const ADMIN_SESSION_COOKIE = "ff_admin_session";

function secretsMatch(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function verifyAdminSecret(provided: string | null | undefined): boolean {
  if (!provided) {
    return false;
  }

  const expected = process.env.ADMIN_SECRET;
  if (expected && secretsMatch(provided, expected)) {
    return true;
  }

  // Seeded example credentials are accepted only outside production.
  return isSeededLoginSecret(provided);
}

export function isAdminSessionValid(token: string | undefined): boolean {
  return verifyAdminSecret(token);
}
