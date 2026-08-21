import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { createBusinessRepository } from "@database/repositories/business.repository";
import { DuplicateSlugError, BusinessNotFoundError } from "@database/errors";

function createMockPrisma() {
  return {
    business: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
}

describe("businessRepository", () => {
  const prisma = createMockPrisma();
  const repository = createBusinessRepository(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a business with valid input", async () => {
    const input = {
      name: "Cafe Edelweiss",
      slug: "cafe-edelweiss",
      ownerEmail: "owner@example.com",
      ownerWhatsApp: "+919876543210",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
    };

    prisma.business.create.mockResolvedValue({
      id: "biz-1",
      ...input,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.create(input);

    expect(result.slug).toBe("cafe-edelweiss");
    expect(prisma.business.create).toHaveBeenCalledWith({
      data: { ...input, ownerSmsPhone: null, paymentReference: null },
    });
  });

  it("throws DuplicateSlugError when slug already exists", async () => {
    prisma.business.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "6.0.0",
      }),
    );

    await expect(
      repository.create({
        name: "Test",
        slug: "duplicate",
        ownerEmail: "a@b.com",
        googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
      }),
    ).rejects.toBeInstanceOf(DuplicateSlugError);
  });

  it("finds active business by slug", async () => {
    prisma.business.findFirst.mockResolvedValue({
      id: "biz-1",
      slug: "cafe-edelweiss",
      name: "Cafe Edelweiss",
      isActive: true,
    });

    const result = await repository.findActiveBySlug("cafe-edelweiss");

    expect(result?.slug).toBe("cafe-edelweiss");
    expect(prisma.business.findFirst).toHaveBeenCalledWith({
      where: { slug: "cafe-edelweiss", isActive: true },
    });
  });

  it("returns null for inactive business slug", async () => {
    prisma.business.findFirst.mockResolvedValue(null);

    const result = await repository.findActiveBySlug("inactive-cafe");

    expect(result).toBeNull();
  });

  it("finds business by slug regardless of active status", async () => {
    prisma.business.findUnique.mockResolvedValue({
      id: "biz-1",
      slug: "inactive-cafe",
      isActive: false,
    });

    const result = await repository.findBySlug("inactive-cafe");

    expect(result?.slug).toBe("inactive-cafe");
    expect(prisma.business.findUnique).toHaveBeenCalledWith({
      where: { slug: "inactive-cafe" },
    });
  });

  it("updates ownerEmail and googleReviewUrl", async () => {
    prisma.business.findUnique.mockResolvedValue({ id: "biz-1" });
    prisma.business.update.mockResolvedValue({
      id: "biz-1",
      ownerEmail: "new@example.com",
      googleReviewUrl: "https://g.page/r/abc/review",
    });

    const result = await repository.update("biz-1", {
      ownerEmail: "new@example.com",
      googleReviewUrl: "https://g.page/r/abc/review",
    });

    expect(result.ownerEmail).toBe("new@example.com");
  });

  it("throws BusinessNotFoundError when updating missing business", async () => {
    prisma.business.findUnique.mockResolvedValue(null);

    await expect(repository.update("missing", { name: "X" })).rejects.toBeInstanceOf(
      BusinessNotFoundError,
    );
  });

  it("deactivates business by setting isActive to false", async () => {
    prisma.business.findUnique.mockResolvedValue({ id: "biz-1", isActive: true });
    prisma.business.update.mockResolvedValue({ id: "biz-1", isActive: false });

    const result = await repository.deactivate("biz-1");

    expect(result.isActive).toBe(false);
    expect(prisma.business.update).toHaveBeenCalledWith({
      where: { id: "biz-1" },
      data: { isActive: false },
    });
  });

  it("deletes business by id", async () => {
    prisma.business.findUnique.mockResolvedValue({ id: "biz-1", slug: "cafe-demo" });
    prisma.business.delete.mockResolvedValue({ id: "biz-1", slug: "cafe-demo" });

    const result = await repository.delete("biz-1");

    expect(result.id).toBe("biz-1");
    expect(prisma.business.delete).toHaveBeenCalledWith({
      where: { id: "biz-1" },
    });
  });

  it("lists all businesses ordered by createdAt desc", async () => {
    prisma.business.findMany.mockResolvedValue([{ id: "biz-2" }, { id: "biz-1" }]);

    const result = await repository.findAll();

    expect(result).toHaveLength(2);
    expect(prisma.business.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });
});
