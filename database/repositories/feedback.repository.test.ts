import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFeedbackRepository } from "@database/repositories/feedback.repository";
import { FeedbackNotFoundError } from "@database/errors";

function createMockPrisma() {
  return {
    feedback: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  };
}

describe("feedbackRepository", () => {
  const prisma = createMockPrisma();
  const repository = createFeedbackRepository(prisma as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates feedback with rating and comment", async () => {
    prisma.feedback.create.mockResolvedValue({
      id: "fb-1",
      businessId: "biz-1",
      rating: 2,
      comment: "Slow service",
      clickedGoogle: false,
      createdAt: new Date(),
    });

    const result = await repository.create({
      businessId: "biz-1",
      rating: 2,
      comment: "Slow service",
    });

    expect(result.rating).toBe(2);
    expect(prisma.feedback.create).toHaveBeenCalledWith({
      data: {
        businessId: "biz-1",
        rating: 2,
        comment: "Slow service",
        customerPhone: null,
        clickedGoogle: false,
        locationLabel: "main",
      },
    });
  });

  it("creates google-click feedback without rating", async () => {
    prisma.feedback.create.mockResolvedValue({
      id: "fb-2",
      businessId: "biz-1",
      rating: null,
      comment: null,
      clickedGoogle: true,
      createdAt: new Date(),
    });

    const result = await repository.create({
      businessId: "biz-1",
      clickedGoogle: true,
    });

    expect(result.clickedGoogle).toBe(true);
    expect(result.rating).toBeNull();
  });

  it("lists feedback for a business ordered by createdAt desc", async () => {
    prisma.feedback.findMany.mockResolvedValue([{ id: "fb-2" }, { id: "fb-1" }]);

    const result = await repository.findByBusinessId("biz-1");

    expect(result).toHaveLength(2);
    expect(prisma.feedback.findMany).toHaveBeenCalledWith({
      where: { businessId: "biz-1" },
      orderBy: { createdAt: "desc" },
      take: undefined,
    });
  });

  it("marks alert as sent with alertSentAt timestamp", async () => {
    prisma.feedback.findUnique.mockResolvedValue({ id: "fb-1", alertSentAt: null });
    const sentAt = new Date("2026-07-20T10:00:00Z");
    prisma.feedback.update.mockResolvedValue({ id: "fb-1", alertSentAt: sentAt });

    const result = await repository.markAlertSent("fb-1", sentAt);

    expect(result.alertSentAt).toEqual(sentAt);
  });

  it("throws FeedbackNotFoundError when marking alert on missing feedback", async () => {
    prisma.feedback.findUnique.mockResolvedValue(null);

    await expect(repository.markAlertSent("missing", new Date())).rejects.toBeInstanceOf(
      FeedbackNotFoundError,
    );
  });

  it("does not duplicate alert when alertSentAt is already set", async () => {
    const existing = { id: "fb-1", alertSentAt: new Date("2026-07-20T09:00:00Z") };
    prisma.feedback.findUnique.mockResolvedValue(existing);

    const result = await repository.markAlertSent("fb-1", new Date());

    expect(result.alertSentAt).toEqual(existing.alertSentAt);
    expect(prisma.feedback.update).not.toHaveBeenCalled();
  });
});
