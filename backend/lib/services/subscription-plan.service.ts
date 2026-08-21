import type {
  CreateSubscriptionPlanInput,
  SubscriptionPlanRepository,
  UpdateSubscriptionPlanInput,
} from "@database/repositories/subscription-plan.repository";

export function createSubscriptionPlanService(repository: SubscriptionPlanRepository) {
  return {
    listPlans() {
      return repository.findAll();
    },

    listPublicPlans() {
      return repository.findPublic();
    },

    getByKey(key: string) {
      return repository.findByKey(key);
    },

    createPlan(input: CreateSubscriptionPlanInput) {
      return repository.create(input);
    },

    updatePlan(id: string, input: UpdateSubscriptionPlanInput) {
      return repository.update(id, input);
    },

    deletePlan(id: string) {
      return repository.delete(id);
    },
  };
}

export type SubscriptionPlanService = ReturnType<typeof createSubscriptionPlanService>;
