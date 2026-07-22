import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { BusinessNotFoundError, DuplicateSlugError } from "@database/errors";
import type { CreateBusinessInput, UpdateBusinessInput } from "@database/types";

export function createBusinessRepository(prisma: PrismaClient) {
  return {
    async create(data: CreateBusinessInput) {
      try {
        return await prisma.business.create({
          data: {
            ...data,
            ownerWhatsApp: data.ownerWhatsApp || null,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new DuplicateSlugError(data.slug);
        }
        throw error;
      }
    },

    async findById(id: string) {
      return prisma.business.findUnique({ where: { id } });
    },

    async findActiveBySlug(slug: string) {
      return prisma.business.findFirst({
        where: { slug, isActive: true },
      });
    },

    async findBySlug(slug: string) {
      return prisma.business.findUnique({ where: { slug } });
    },

    async findAll() {
      return prisma.business.findMany({
        orderBy: { createdAt: "desc" },
      });
    },

    async update(id: string, data: UpdateBusinessInput) {
      const existing = await prisma.business.findUnique({ where: { id } });
      if (!existing) {
        throw new BusinessNotFoundError(id);
      }

      return prisma.business.update({
        where: { id },
        data: {
          ...data,
          ownerWhatsApp:
            data.ownerWhatsApp === undefined ? undefined : data.ownerWhatsApp || null,
        },
      });
    },

    async deactivate(id: string) {
      const existing = await prisma.business.findUnique({ where: { id } });
      if (!existing) {
        throw new BusinessNotFoundError(id);
      }

      return prisma.business.update({
        where: { id },
        data: { isActive: false },
      });
    },

    async delete(id: string) {
      const existing = await prisma.business.findUnique({ where: { id } });
      if (!existing) {
        throw new BusinessNotFoundError(id);
      }

      return prisma.business.delete({
        where: { id },
      });
    },
  };
}

export type BusinessRepository = ReturnType<typeof createBusinessRepository>;
