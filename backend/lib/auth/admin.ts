import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { businessRepository } from "@database/index";
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

export function createOwnerSessionToken(): string {
  return `os_${randomBytes(32).toString("hex")}`;
}

export function hashAccessSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export async function verifyAdminSecret(provided: string | null | undefined): Promise<boolean> {
  if (!provided) {
    return false;
  }

  const expected = process.env.ADMIN_SECRET;
  if (expected && secretsMatch(provided, expected)) {
    return true;
  }

  if (isSeededLoginSecret(provided)) {
    return true;
  }

  if (/^os_[a-f0-9]{64}$/.test(provided)) {
    const business = await businessRepository.findByOwnerSessionToken(provided);
    return Boolean(business);
  }

  const hashed = hashAccessSecret(provided);
  const byHash = await businessRepository.findByOwnerAccessSecret(hashed);
  if (byHash) {
    return true;
  }

  // Legacy / demo plaintext match for older rows.
  const byPlain = await businessRepository.findByOwnerAccessSecret(provided);
  return Boolean(byPlain);
}

export async function isAdminSessionValid(token: string | undefined): Promise<boolean> {
  return verifyAdminSecret(token);
}

export async function resolveOwnerBusinessId(token: string | undefined): Promise<string | null> {
  if (!token) {
    return null;
  }

  if (/^os_[a-f0-9]{64}$/.test(token)) {
    const business = await businessRepository.findByOwnerSessionToken(token);
    return business?.id ?? null;
  }

  const hashed = hashAccessSecret(token);
  const byHash = await businessRepository.findByOwnerAccessSecret(hashed);
  if (byHash) {
    return byHash.id;
  }

  const byPlain = await businessRepository.findByOwnerAccessSecret(token);
  return byPlain?.id ?? null;
}
