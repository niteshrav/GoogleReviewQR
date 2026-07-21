import type { PrismaClient } from "@prisma/client";
import { FeedbackNotFoundError } from "@database/errors";
import type { CreateFeedbackInput, ListFeedbackOptions } from "@database/types";

export function createFeedbackRepository(prisma: PrismaClient) {
  return {
    async create(data: CreateFeedbackInput) {
      return prisma.feedback.create({
        data: {
          businessId: data.businessId,
          rating: data.rating ?? null,
          comment: data.comment ?? null,
          clickedGoogle: data.clickedGoogle ?? false,
          locationLabel: data.locationLabel ?? "main",
        },
      });
    },

    async findById(id: string) {
      return prisma.feedback.findUnique({ where: { id } });
    },

    async findByBusinessId(businessId: string, limit?: number) {
      return prisma.feedback.findMany({
        where: { businessId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    },

    async listByBusiness({ businessId, limit }: ListFeedbackOptions) {
      return this.findByBusinessId(businessId, limit);
    },

    async markAlertSent(id: string, sentAt: Date = new Date()) {
      const existing = await prisma.feedback.findUnique({ where: { id } });
      if (!existing) {
        throw new FeedbackNotFoundError(id);
      }

      if (existing.alertSentAt) {
        return existing;
      }

      return prisma.feedback.update({
        where: { id },
        data: { alertSentAt: sentAt },
      });
    },
  };
}

export type FeedbackRepository = ReturnType<typeof createFeedbackRepository>;
