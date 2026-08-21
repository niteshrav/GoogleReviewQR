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
          customerName: data.customerName ?? null,
          customerPhone: data.customerPhone ?? null,
          clickedGoogle: data.clickedGoogle ?? false,
          locationLabel: data.locationLabel ?? "main",
          alertChannel: data.alertChannel ?? null,
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

    async markAlertSent(
      id: string,
      details: { sentAt?: Date; channel?: string | null } = {},
    ) {
      const existing = await prisma.feedback.findUnique({ where: { id } });
      if (!existing) {
        throw new FeedbackNotFoundError(id);
      }

      if (existing.alertSentAt) {
        return existing;
      }

      return prisma.feedback.update({
        where: { id },
        data: {
          alertSentAt: details.sentAt ?? new Date(),
          alertChannel: details.channel ?? existing.alertChannel,
        },
      });
    },
  };
}

export type FeedbackRepository = ReturnType<typeof createFeedbackRepository>;
