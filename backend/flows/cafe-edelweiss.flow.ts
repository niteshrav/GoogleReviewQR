import { createBusinessService } from "@backend/lib/services/business.service";
import { createFeedbackService } from "@backend/lib/services/feedback.service";
import type { PilotBusinessSeed } from "@backend/lib/fixtures/pilot-businesses";
import type { sendOwnerAlert } from "@backend/lib/alerts/send-owner-alert";
import { DuplicateSlugError, BusinessNotFoundError } from "@database/errors";
import type { CreateBusinessInput, UpdateBusinessInput } from "@database/types";
import type { CreateFeedbackInput, ListFeedbackOptions } from "@database/types";

type BusinessRecord = CreateBusinessInput & {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type FeedbackRecord = {
  id: string;
  businessId: string;
  rating: number | null;
  comment: string | null;
  customerName: string | null;
  customerPhone: string | null;
  clickedGoogle: boolean;
  locationLabel: string;
  alertSentAt: Date | null;
  createdAt: Date;
};

function createInMemoryBusinessRepository(seed: PilotBusinessSeed) {
  const businesses: BusinessRecord[] = [
    {
      id: "biz-cafe-edelweiss",
      ...seed,
      isActive: true,
      createdAt: new Date("2026-07-01T00:00:00.000Z"),
      updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    },
  ];

  return {
    async create(data: CreateBusinessInput) {
      if (businesses.some((b) => b.slug === data.slug)) {
        throw new DuplicateSlugError(data.slug);
      }
      const created: BusinessRecord = {
        id: `biz-${businesses.length + 1}`,
        ...data,
        ownerWhatsApp: data.ownerWhatsApp || null,
        ownerSmsPhone: data.ownerSmsPhone || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      businesses.push(created);
      return created;
    },
    async findById(id: string) {
      return businesses.find((b) => b.id === id) ?? null;
    },
    async findActiveBySlug(slug: string) {
      return businesses.find((b) => b.slug === slug && b.isActive) ?? null;
    },
    async findBySlug(slug: string) {
      return businesses.find((b) => b.slug === slug) ?? null;
    },
    async findAll() {
      return [...businesses].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    async update(id: string, data: UpdateBusinessInput) {
      const existing = businesses.find((b) => b.id === id);
      if (!existing) {
        throw new BusinessNotFoundError(id);
      }
      Object.assign(existing, data, { updatedAt: new Date() });
      return existing;
    },
    async deactivate(id: string) {
      return this.update(id, { isActive: false });
    },
    async delete(id: string) {
      const index = businesses.findIndex((item) => item.id === id);
      if (index < 0) {
        throw new BusinessNotFoundError(id);
      }
      const [removed] = businesses.splice(index, 1);
      return removed;
    },
  };
}

function createInMemoryFeedbackRepository() {
  const feedbacks: FeedbackRecord[] = [];
  let clock = Date.parse("2026-07-20T12:00:00.000Z");

  return {
    async create(data: CreateFeedbackInput) {
      clock += 1000;
      const created: FeedbackRecord = {
        id: `fb-${feedbacks.length + 1}`,
        businessId: data.businessId,
        rating: data.rating ?? null,
        comment: data.comment ?? null,
        customerName: data.customerName ?? null,
        customerPhone: data.customerPhone ?? null,
        clickedGoogle: data.clickedGoogle ?? false,
        locationLabel: data.locationLabel ?? "main",
        alertSentAt: null,
        createdAt: new Date(clock),
      };
      feedbacks.push(created);
      return created;
    },
    async findById(id: string) {
      return feedbacks.find((f) => f.id === id) ?? null;
    },
    async findByBusinessId(businessId: string, limit?: number) {
      const rows = feedbacks
        .filter((f) => f.businessId === businessId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return typeof limit === "number" ? rows.slice(0, limit) : rows;
    },
    async listByBusiness({ businessId, limit }: ListFeedbackOptions) {
      return this.findByBusinessId(businessId, limit);
    },
    async markAlertSent(id: string, sentAt: Date = new Date()) {
      const existing = feedbacks.find((f) => f.id === id);
      if (!existing) {
        throw new Error(`Feedback not found: ${id}`);
      }
      if (existing.alertSentAt) {
        return existing;
      }
      existing.alertSentAt = sentAt;
      return existing;
    },
  };
}

export type CafeEdelweissFlowInput = {
  seed: PilotBusinessSeed;
  customer: {
    rating: number;
    comment?: string | null;
  };
  sendOwnerAlertFn: typeof sendOwnerAlert;
  skipGoogleClick?: boolean;
};

/**
 * End-to-end seeded flow for Cafe Edelweiss (service layer).
 * Mirrors: QR scan → Google click → private feedback → owner alert → admin log.
 */
export async function runCafeEdelweissFlow(input: CafeEdelweissFlowInput) {
  const businessRepository = createInMemoryBusinessRepository(input.seed);
  const feedbackRepository = createInMemoryFeedbackRepository();
  const businessService = createBusinessService(businessRepository as never);
  const feedbackService = createFeedbackService({
    businessRepository: businessRepository as never,
    feedbackRepository: feedbackRepository as never,
    sendOwnerAlertFn: input.sendOwnerAlertFn,
  });

  const business = await businessService.getActiveBusinessBySlug(input.seed.slug);
  if (!business) {
    throw new Error(`Seeded business not found: ${input.seed.slug}`);
  }

  let googleClickRecord: FeedbackRecord | null = null;
  if (!input.skipGoogleClick) {
    const googleClick = await feedbackService.logGoogleClick(input.seed.slug);
    if (!googleClick) {
      throw new Error("Google click logging failed");
    }
    googleClickRecord = (await feedbackRepository.findById(googleClick.feedbackId)) as FeedbackRecord;
  }

  const privateResult = await feedbackService.submitPrivateFeedback({
    businessSlug: input.seed.slug,
    rating: input.customer.rating,
    comment: input.customer.comment,
  });
  if (!privateResult) {
    throw new Error("Private feedback submission failed");
  }

  const privateFeedback = (await feedbackRepository.findById(
    privateResult.feedbackId,
  )) as FeedbackRecord;

  const adminLog = await feedbackService.listFeedbackForBusiness(business.id);

  return {
    business,
    googleReviewUrl: business.googleReviewUrl,
    googleClick: googleClickRecord
      ? {
          feedbackId: googleClickRecord.id,
          clickedGoogle: googleClickRecord.clickedGoogle,
          rating: googleClickRecord.rating,
        }
      : {
          feedbackId: null,
          clickedGoogle: false,
          rating: null,
        },
    privateFeedback: {
      feedbackId: privateFeedback.id,
      rating: privateFeedback.rating,
      comment: privateFeedback.comment,
      alertSentAt: privateFeedback.alertSentAt,
    },
    adminLog,
    // Compliance: Google CTA is always shown on landing + thank-you; never rating-gated.
    googleCtaAlwaysVisible: true,
  };
}
