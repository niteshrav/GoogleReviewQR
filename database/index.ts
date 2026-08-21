import { db } from "@database/client";
import { createBusinessRepository } from "@database/repositories/business.repository";
import { createFeedbackRepository } from "@database/repositories/feedback.repository";
import { createSubscriptionPlanRepository } from "@database/repositories/subscription-plan.repository";

export { db } from "@database/client";
export * from "@database/errors";
export * from "@database/types";
export {
  createBusinessRepository,
  type BusinessRepository,
} from "@database/repositories/business.repository";
export {
  createFeedbackRepository,
  type FeedbackRepository,
} from "@database/repositories/feedback.repository";
export {
  createSubscriptionPlanRepository,
  DuplicatePlanKeyError,
  SubscriptionPlanNotFoundError,
  type CreateSubscriptionPlanInput,
  type UpdateSubscriptionPlanInput,
  type SubscriptionPlanRepository,
} from "@database/repositories/subscription-plan.repository";

export const businessRepository = createBusinessRepository(db);
export const feedbackRepository = createFeedbackRepository(db);
export const subscriptionPlanRepository = createSubscriptionPlanRepository(db);
