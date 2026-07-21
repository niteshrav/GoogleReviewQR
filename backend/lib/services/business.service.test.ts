import { beforeEach, describe, expect, it, vi } from "vitest";
import { DuplicateSlugError, BusinessNotFoundError } from "@database/errors";
import { createBusinessService } from "@backend/lib/services/business.service";

function createMockRepository() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findActiveBySlug: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
  };
}

describe("businessService", () => {
  const repository = createMockRepository();
  const service = createBusinessService(repository as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a business with valid input", async () => {
    repository.create.mockResolvedValue({ id: "biz-1", slug: "cafe-edelweiss" });

    const result = await service.createBusiness({
      name: "Cafe Edelweiss",
      slug: "cafe-edelweiss",
      ownerEmail: "owner@example.com",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
    });

    expect(result.slug).toBe("cafe-edelweiss");
  });

  it("propagates DuplicateSlugError", async () => {
    repository.create.mockRejectedValue(new DuplicateSlugError("taken"));

    await expect(
      service.createBusiness({
        name: "Test",
        slug: "taken",
        ownerEmail: "a@b.com",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
      }),
    ).rejects.toBeInstanceOf(DuplicateSlugError);
  });

  it("updates business fields", async () => {
    repository.update.mockResolvedValue({ id: "biz-1", ownerEmail: "new@example.com" });

    const result = await service.updateBusiness("biz-1", { ownerEmail: "new@example.com" });

    expect(result.ownerEmail).toBe("new@example.com");
  });

  it("deactivates a business", async () => {
    repository.deactivate.mockResolvedValue({ id: "biz-1", isActive: false });

    const result = await service.deactivateBusiness("biz-1");

    expect(result.isActive).toBe(false);
  });

  it("finds active business by slug for customer pages", async () => {
    repository.findActiveBySlug.mockResolvedValue({ slug: "cafe-edelweiss" });

    const result = await service.getActiveBusinessBySlug("cafe-edelweiss");

    expect(result?.slug).toBe("cafe-edelweiss");
  });

  it("lists all businesses for admin", async () => {
    repository.findAll.mockResolvedValue([{ id: "biz-1" }, { id: "biz-2" }]);

    const result = await service.listBusinesses();

    expect(result).toHaveLength(2);
  });

  it("throws BusinessNotFoundError from repository on update", async () => {
    repository.update.mockRejectedValue(new BusinessNotFoundError("missing"));

    await expect(service.updateBusiness("missing", { name: "X" })).rejects.toBeInstanceOf(
      BusinessNotFoundError,
    );
  });
});
