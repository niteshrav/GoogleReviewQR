import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@database/index", () => ({
  businessRepository: {
    findByOwnerAccessSecret: vi.fn().mockResolvedValue(null),
    findByOwnerSessionToken: vi.fn().mockResolvedValue(null),
  },
}));

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

  it("validates matching admin secrets with timing-safe compare", async () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_SECRET = "test-admin-secret-key";
    expect(await verifyAdminSecret("test-admin-secret-key")).toBe(true);
    expect(await verifyAdminSecret("wrong-secret-key")).toBe(false);
  });

  it("validates admin cookies for middleware", () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_SECRET = "test-admin-secret-key";
    expect(hasValidAdminCookie("test-admin-secret-key")).toBe(true);
    expect(hasValidAdminCookie(undefined)).toBe(false);
    expect(hasValidAdminCookie(`os_${"a".repeat(64)}`)).toBe(true);
  });

  it("accepts seeded example cookies in development middleware", () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_SECRET = "test-admin-secret-key";
    const seeded = getSeededLoginCredentials()[0];
    expect(seeded).toBeDefined();
    expect(hasValidAdminCookie(seeded!.secret)).toBe(true);
  });
});
