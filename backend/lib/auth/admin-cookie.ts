import {
  isSeededLoginAllowed,
  listSeededLoginSecrets,
} from "@backend/lib/fixtures/seeded-login-credentials";

export const ADMIN_SESSION_COOKIE = "ff_admin_session";

/** Edge-safe cookie check used by middleware (no Node crypto / DB). */
export function looksLikeOwnerSessionToken(token: string): boolean {
  return /^os_[a-f0-9]{64}$/.test(token);
}

export function hasValidAdminCookie(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const expected = process.env.ADMIN_SECRET;
  if (expected && token === expected) {
    return true;
  }

  // Owner sessions are minted at signup/login; layout verifies against DB.
  if (looksLikeOwnerSessionToken(token)) {
    return true;
  }

  if (!isSeededLoginAllowed()) {
    return false;
  }

  return listSeededLoginSecrets().includes(token);
}
