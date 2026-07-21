import type { BusinessRepository } from "@database/repositories/business.repository";
import type { FeedbackRepository } from "@database/repositories/feedback.repository";
import { shouldTriggerAlert } from "@backend/lib/alerts/should-trigger-alert";
import { buildWhatsAppLink, sendLowRatingAlert } from "@backend/lib/email/smtp";

type FeedbackServiceDeps = {
  businessRepository: BusinessRepository;
  feedbackRepository: FeedbackRepository;
  sendAlert?: typeof sendLowRatingAlert;
};

export function createFeedbackService(deps: FeedbackServiceDeps) {
  const sendAlert = deps.sendAlert ?? sendLowRatingAlert;

  return {
    async submitPrivateFeedback(input: {
      businessSlug: string;
      rating: number;
      comment?: string | null;
    }) {
      const business = await deps.businessRepository.findActiveBySlug(input.businessSlug);
      if (!business) {
        return null;
      }

      const feedback = await deps.feedbackRepository.create({
        businessId: business.id,
        rating: input.rating,
        comment: input.comment?.trim() || null,
      });

      if (shouldTriggerAlert(input.rating)) {
        const whatsAppLink = business.ownerWhatsApp
          ? buildWhatsAppLink(
              business.ownerWhatsApp,
              business.name,
              input.rating,
              input.comment,
            )
          : null;

        try {
          await sendAlert({
            to: business.ownerEmail,
            businessName: business.name,
            rating: input.rating,
            comment: input.comment,
            timestamp: feedback.createdAt,
            whatsAppLink,
          });
          await deps.feedbackRepository.markAlertSent(feedback.id);
        } catch (error) {
          console.error("Failed to send low-rating alert", error);
        }
      }

      return { feedbackId: feedback.id, businessId: business.id };
    },

    async logGoogleClick(businessSlug: string) {
      const business = await deps.businessRepository.findActiveBySlug(businessSlug);
      if (!business) {
        return null;
      }

      const feedback = await deps.feedbackRepository.create({
        businessId: business.id,
        clickedGoogle: true,
      });

      return { feedbackId: feedback.id };
    },

    async listFeedbackForBusiness(businessId: string) {
      return deps.feedbackRepository.listByBusiness({ businessId });
    },
  };
}

export type FeedbackService = ReturnType<typeof createFeedbackService>;
