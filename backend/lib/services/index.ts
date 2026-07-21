import { businessRepository, feedbackRepository } from "@database/index";
import { createBusinessService } from "@backend/lib/services/business.service";
import { createFeedbackService } from "@backend/lib/services/feedback.service";

export const businessService = createBusinessService(businessRepository);
export const feedbackService = createFeedbackService({
  businessRepository,
  feedbackRepository,
});
