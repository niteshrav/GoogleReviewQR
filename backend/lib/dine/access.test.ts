import { beforeEach, describe, expect, it, vi } from "vitest";

const findAll = vi.fn();
const findById = vi.fn();

vi.mock("@database/index", () => ({
  businessRepository: {
    findAll: () => findAll(),
    findById: (id: string) => findById(id),
  },
}));

vi.mock("@backend/lib/auth/admin", () => ({
  ADMIN_SESSION_COOKIE: "ff_admin_session",
  resolveOwnerBusinessId: vi.fn(),
  verifyAdminSecret: vi.fn(),
}));

vi.mock("@backend/lib/env", () => ({
  getEnv: () => ({ BASE_URL: "http://localhost:3000" }),
}));

import {
  DineAuthError,
  isPlatformAdmin,
  listDineProRestaurants,
  resolveAccessibleDineBusinessId,
} from "@backend/lib/dine/access";

const toast = { id: "toast", name: "The Toast House", slug: "the-toast-house", isActive: true, plan: "dinepro" };
const bistro = { id: "bistro", name: "Bistro Nine", slug: "bistro-nine", isActive: true, plan: "dinepro" };
const cafe = { id: "cafe", name: "Cafe Edelweiss", slug: "cafe-edelweiss", isActive: true, plan: "core" };
const closed = { id: "closed", name: "Closed Diner", slug: "closed-diner", isActive: false, plan: "dinepro" };

const platform = { ownerBusinessId: null, isPlatform: true };

describe("isPlatformAdmin", () => {
  it("treats seeded demo logins as platform admin outside production", () => {
    expect(isPlatformAdmin("seed-cafe-edelweiss-admin")).toBe(true);
    expect(isPlatformAdmin("os_" + "a".repeat(64))).toBe(false);
    expect(isPlatformAdmin(undefined)).toBe(false);
  });

  it("never treats seeded logins as platform admin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      expect(isPlatformAdmin("seed-cafe-edelweiss-admin")).toBe(false);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("listDineProRestaurants", () => {
  beforeEach(() => {
    findAll.mockResolvedValue([toast, cafe, closed, bistro]);
  });

  it("returns only active DinePro businesses, sorted by name", async () => {
    expect(await listDineProRestaurants()).toEqual([
      { id: "bistro", name: "Bistro Nine", slug: "bistro-nine" },
      { id: "toast", name: "The Toast House", slug: "the-toast-house" },
    ]);
  });
});

describe("resolveAccessibleDineBusinessId (platform admin)", () => {
  beforeEach(() => {
    findAll.mockResolvedValue([toast, cafe, bistro]);
    findById.mockImplementation(async (id: string) => [toast, cafe, bistro].find((b) => b.id === id) ?? null);
  });

  it("uses the restaurant chosen in the picker", async () => {
    expect(await resolveAccessibleDineBusinessId({ ...platform, selectedBusinessId: "toast" })).toBe("toast");
  });

  it("falls back to the first DinePro restaurant when nothing (or a stale id) is chosen", async () => {
    expect(await resolveAccessibleDineBusinessId(platform)).toBe("bistro");
    expect(await resolveAccessibleDineBusinessId({ ...platform, selectedBusinessId: "cafe" })).toBe("bistro");
  });

  it("an explicit businessId still wins and must be a DinePro business", async () => {
    expect(await resolveAccessibleDineBusinessId(platform, "toast")).toBe("toast");
    await expect(resolveAccessibleDineBusinessId(platform, "cafe")).rejects.toBeInstanceOf(DineAuthError);
  });

  it("explains what to do when no restaurant has the DinePro plan", async () => {
    findAll.mockResolvedValue([cafe]);
    await expect(resolveAccessibleDineBusinessId(platform)).rejects.toThrow(/set a business's plan to DinePro/);
  });
});

describe("resolveAccessibleDineBusinessId (owner)", () => {
  beforeEach(() => {
    findById.mockImplementation(async (id: string) => [toast, cafe].find((b) => b.id === id) ?? null);
  });

  it("ignores the picker cookie and stays locked to the owner's restaurant", async () => {
    const owner = { ownerBusinessId: "toast", isPlatform: false, selectedBusinessId: "bistro" };
    expect(await resolveAccessibleDineBusinessId(owner)).toBe("toast");
    await expect(resolveAccessibleDineBusinessId(owner, "bistro")).rejects.toMatchObject({ status: 403 });
  });
});
