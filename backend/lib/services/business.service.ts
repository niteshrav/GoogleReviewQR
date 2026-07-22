import type { BusinessRepository } from "@database/repositories/business.repository";
import type { BusinessInput } from "@backend/lib/validators";
import type { UpdateBusinessInput } from "@database/types";

export function createBusinessService(repository: BusinessRepository) {
  return {
    async createBusiness(input: BusinessInput) {
      return repository.create({
        name: input.name,
        slug: input.slug,
        ownerEmail: input.ownerEmail,
        ownerWhatsApp: input.ownerWhatsApp || null,
        googleReviewUrl: input.googleReviewUrl,
      });
    },

    async listBusinesses() {
      return repository.findAll();
    },

    async getBusinessById(id: string) {
      return repository.findById(id);
    },

    async getActiveBusinessBySlug(slug: string) {
      return repository.findActiveBySlug(slug);
    },

    async getBusinessBySlug(slug: string) {
      return repository.findBySlug(slug);
    },

    async updateBusiness(id: string, input: UpdateBusinessInput) {
      return repository.update(id, input);
    },

    async deactivateBusiness(id: string) {
      return repository.deactivate(id);
    },

    async deleteBusiness(id: string) {
      return repository.delete(id);
    },
  };
}

export type BusinessService = ReturnType<typeof createBusinessService>;
