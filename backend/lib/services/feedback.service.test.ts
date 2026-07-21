import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFeedbackService } from "@backend/lib/services/feedback.service";

function createMocks() {
  return {
    businessRepository: {
      findActiveBySlug: vi.fn(),
    },
    feedbackRepository: {
      create: vi.fn(),
      listByBusiness: vi.fn(),
      markAlertSent: vi.fn(),
    },
    sendAlert: vi.fn(),
  };
}

describe("feedbackService", () => {
  const mocks = createMocks();
  const service = createFeedbackService(mocks as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits private feedback for an active business", async () => {
    mocks.businessRepository.findActiveBySlug.mockResolvedValue({
      id: "biz-1",
      name: "Cafe",
      ownerEmail: "owner@example.com",
      ownerWhatsApp: null,
    });
    mocks.feedbackRepository.create.mockResolvedValue({
      id: "fb-1",
      rating: 2,
      createdAt: new Date(),
    });

    const result = await service.submitPrivateFeedback({
      businessSlug: "cafe-edelweiss",
      rating: 2,
      comment: "Slow",
    });

    expect(result.feedbackId).toBe("fb-1");
    expect(mocks.sendAlert).toHaveBeenCalledOnce();
  });

  it("returns null business when slug is inactive or missing", async () => {
    mocks.businessRepository.findActiveBySlug.mockResolvedValue(null);

    const result = await service.submitPrivateFeedback({
      businessSlug: "missing",
      rating: 2,
    });

    expect(result).toBeNull();
  });

  it("does not send alert for ratings above 3", async () => {
    mocks.businessRepository.findActiveBySlug.mockResolvedValue({
      id: "biz-1",
      name: "Cafe",
      ownerEmail: "owner@example.com",
    });
    mocks.feedbackRepository.create.mockResolvedValue({
      id: "fb-1",
      rating: 5,
      createdAt: new Date(),
    });

    await service.submitPrivateFeedback({
      businessSlug: "cafe-edelweiss",
      rating: 5,
    });

    expect(mocks.sendAlert).not.toHaveBeenCalled();
  });

  it("logs google click without alert", async () => {
    mocks.businessRepository.findActiveBySlug.mockResolvedValue({ id: "biz-1" });
    mocks.feedbackRepository.create.mockResolvedValue({ id: "fb-2" });

    const result = await service.logGoogleClick("cafe-edelweiss");

    expect(result?.feedbackId).toBe("fb-2");
    expect(mocks.feedbackRepository.create).toHaveBeenCalledWith({
      businessId: "biz-1",
      clickedGoogle: true,
    });
    expect(mocks.sendAlert).not.toHaveBeenCalled();
  });

  it("lists feedback for admin", async () => {
    mocks.feedbackRepository.listByBusiness.mockResolvedValue([{ id: "fb-1" }]);

    const result = await service.listFeedbackForBusiness("biz-1");

    expect(result).toHaveLength(1);
  });

  it("still saves feedback when email send fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.businessRepository.findActiveBySlug.mockResolvedValue({
      id: "biz-1",
      name: "Cafe",
      ownerEmail: "owner@example.com",
      ownerWhatsApp: null,
    });
    mocks.feedbackRepository.create.mockResolvedValue({
      id: "fb-3",
      rating: 1,
      createdAt: new Date(),
    });
    mocks.sendAlert.mockRejectedValue(new Error("SMTP down"));

    const result = await service.submitPrivateFeedback({
      businessSlug: "cafe-edelweiss",
      rating: 1,
      comment: "Cold food",
    });

    expect(result?.feedbackId).toBe("fb-3");
    expect(mocks.feedbackRepository.markAlertSent).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("marks alertSentAt after successful send", async () => {
    mocks.businessRepository.findActiveBySlug.mockResolvedValue({
      id: "biz-1",
      name: "Cafe",
      ownerEmail: "owner@example.com",
      ownerWhatsApp: "+919876543210",
    });
    mocks.feedbackRepository.create.mockResolvedValue({
      id: "fb-4",
      rating: 2,
      createdAt: new Date(),
    });
    mocks.sendAlert.mockResolvedValue(undefined);

    await service.submitPrivateFeedback({
      businessSlug: "cafe-edelweiss",
      rating: 2,
    });

    expect(mocks.feedbackRepository.markAlertSent).toHaveBeenCalledWith("fb-4");
  });
});
