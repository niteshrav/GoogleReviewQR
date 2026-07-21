import { afterEach, describe, expect, it } from "vitest";
import { hasValidAdminCookie } from "@backend/lib/auth/admin-cookie";
import { verifyAdminSecret } from "@backend/lib/auth/admin";
import { getSeededLoginCredentials } from "@backend/lib/fixtures/seeded-login-credentials";

const ORIGINAL_ADMIN_SECRET = process.env.ADMIN_SECRET;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

describe("admin auth", () => {
  afterEach(() => {
    process.env.ADMIN_SECRET = ORIGINAL_ADMIN_SECRET;
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  it("validates matching admin secrets with timing-safe compare", () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_SECRET = "test-admin-secret-key";
    expect(verifyAdminSecret("test-admin-secret-key")).toBe(true);
    expect(verifyAdminSecret("wrong-secret-key")).toBe(false);
  });

  it("validates admin cookies for middleware", () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_SECRET = "test-admin-secret-key";
    expect(hasValidAdminCookie("test-admin-secret-key")).toBe(true);
    expect(hasValidAdminCookie(undefined)).toBe(false);
  });

  it("accepts seeded example cookies in development middleware", () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_SECRET = "test-admin-secret-key";
    const seeded = getSeededLoginCredentials()[0];
    expect(seeded).toBeDefined();
    expect(hasValidAdminCookie(seeded!.secret)).toBe(true);
  });
});
