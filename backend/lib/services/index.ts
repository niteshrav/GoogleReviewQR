import { businessRepository, feedbackRepository, subscriptionPlanRepository } from "@database/index";
import { createBusinessService } from "@backend/lib/services/business.service";
import { createFeedbackService } from "@backend/lib/services/feedback.service";
import { createSubscriptionPlanService } from "@backend/lib/services/subscription-plan.service";

export const businessService = createBusinessService(businessRepository);
export const feedbackService = createFeedbackService({
  businessRepository,
  feedbackRepository,
});
export const subscriptionPlanService = createSubscriptionPlanService(subscriptionPlanRepository);
