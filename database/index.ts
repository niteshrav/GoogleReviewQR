import { db } from "@database/client";
import { createBusinessRepository } from "@database/repositories/business.repository";
import { createFeedbackRepository } from "@database/repositories/feedback.repository";

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

export const businessRepository = createBusinessRepository(db);
export const feedbackRepository = createFeedbackRepository(db);
