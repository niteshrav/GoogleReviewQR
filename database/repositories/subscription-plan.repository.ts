import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type CreateSubscriptionPlanInput = {
  key: string;
  name: string;
  tagline?: string | null;
  priceInr: number;
  setupFeeInr?: number;
  features: string[];
  highlighted?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
};

export type UpdateSubscriptionPlanInput = {
  name?: string;
  tagline?: string | null;
  priceInr?: number;
  setupFeeInr?: number;
  features?: string[];
  highlighted?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
};

export class DuplicatePlanKeyError extends Error {
  constructor(key: string) {
    super(`Subscription plan key already exists: ${key}`);
    this.name = "DuplicatePlanKeyError";
  }
}

export class SubscriptionPlanNotFoundError extends Error {
  constructor(id: string) {
    super(`Subscription plan not found: ${id}`);
    this.name = "SubscriptionPlanNotFoundError";
  }
}

export function createSubscriptionPlanRepository(prisma: PrismaClient) {
  return {
    async findAll() {
      return prisma.subscriptionPlan.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
    },

    async findPublic() {
      return prisma.subscriptionPlan.findMany({
        where: { isPublic: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
    },

    async findById(id: string) {
      return prisma.subscriptionPlan.findUnique({ where: { id } });
    },

    async findByKey(key: string) {
      return prisma.subscriptionPlan.findUnique({ where: { key } });
    },

    async create(data: CreateSubscriptionPlanInput) {
      try {
        return await prisma.subscriptionPlan.create({
          data: {
            key: data.key,
            name: data.name,
            tagline: data.tagline ?? null,
            priceInr: data.priceInr,
            setupFeeInr: data.setupFeeInr ?? 2999,
            features: data.features,
            highlighted: data.highlighted ?? false,
            isPublic: data.isPublic ?? true,
            sortOrder: data.sortOrder ?? 0,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new DuplicatePlanKeyError(data.key);
        }
        throw error;
      }
    },

    async update(id: string, data: UpdateSubscriptionPlanInput) {
      const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
      if (!existing) {
        throw new SubscriptionPlanNotFoundError(id);
      }

      return prisma.subscriptionPlan.update({
        where: { id },
        data,
      });
    },

    async delete(id: string) {
      const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
      if (!existing) {
        throw new SubscriptionPlanNotFoundError(id);
      }

      return prisma.subscriptionPlan.delete({ where: { id } });
    },
  };
}

export type SubscriptionPlanRepository = ReturnType<
  typeof createSubscriptionPlanRepository
>;
