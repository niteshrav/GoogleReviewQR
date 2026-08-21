import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@database/index", () => ({
  businessRepository: {
    findByOwnerAccessSecret: vi.fn().mockResolvedValue(null),
    findByOwnerSessionToken: vi.fn().mockResolvedValue(null),
  },
}));

import {
  getSeededLoginCredentials,
  isSeededLoginAllowed,
  listSeededLoginSecrets,
} from "@backend/lib/fixtures/seeded-login-credentials";
import { verifyAdminSecret } from "@backend/lib/auth/admin";
import { PILOT_BUSINESSES } from "@backend/lib/fixtures/pilot-businesses";

const ORIGINAL_ADMIN_SECRET = process.env.ADMIN_SECRET;
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

describe("seeded login credentials", () => {
  afterEach(() => {
    process.env.ADMIN_SECRET = ORIGINAL_ADMIN_SECRET;
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  it("provides one login credential for each seeded pilot example", () => {
    const credentials = getSeededLoginCredentials();

    expect(credentials).toHaveLength(PILOT_BUSINESSES.length);
    expect(credentials.map((c) => c.slug).sort()).toEqual(
      PILOT_BUSINESSES.map((b) => b.slug).sort(),
    );

    for (const credential of credentials) {
      expect(credential.name.length).toBeGreaterThan(0);
      expect(credential.secret.length).toBeGreaterThanOrEqual(16);
      expect(credential.reviewPath).toBe(`/r/${credential.slug}`);
    }
  });

  it("exposes distinct secrets per example", () => {
    const secrets = listSeededLoginSecrets();
    expect(new Set(secrets).size).toBe(secrets.length);
  });

  it("allows seeded login outside production", () => {
    process.env.NODE_ENV = "development";
    expect(isSeededLoginAllowed()).toBe(true);

    process.env.NODE_ENV = "test";
    expect(isSeededLoginAllowed()).toBe(true);

    process.env.NODE_ENV = "production";
    expect(isSeededLoginAllowed()).toBe(false);
  });

  it("accepts each seeded example secret in development", async () => {
    process.env.NODE_ENV = "development";
    process.env.ADMIN_SECRET = "primary-admin-secret-key";

    for (const credential of getSeededLoginCredentials()) {
      expect(await verifyAdminSecret(credential.secret)).toBe(true);
    }
  });

  it("rejects seeded example secrets in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.ADMIN_SECRET = "primary-admin-secret-key";

    for (const credential of getSeededLoginCredentials()) {
      expect(await verifyAdminSecret(credential.secret)).toBe(false);
    }
    expect(await verifyAdminSecret("primary-admin-secret-key")).toBe(true);
  });
});
