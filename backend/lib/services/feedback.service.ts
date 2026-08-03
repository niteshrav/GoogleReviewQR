import type { BusinessRepository } from "@database/repositories/business.repository";
import type { FeedbackRepository } from "@database/repositories/feedback.repository";
import { shouldTriggerAlert } from "@backend/lib/alerts/should-trigger-alert";
import { sendOwnerAlert } from "@backend/lib/alerts/send-owner-alert";

type FeedbackServiceDeps = {
  businessRepository: BusinessRepository;
  feedbackRepository: FeedbackRepository;
  sendOwnerAlertFn?: typeof sendOwnerAlert;
};

export function createFeedbackService(deps: FeedbackServiceDeps) {
  const deliverOwnerAlert = deps.sendOwnerAlertFn ?? sendOwnerAlert;

  return {
    async submitPrivateFeedback(input: {
      businessSlug: string;
      rating: number;
      comment?: string | null;
      customerPhone?: string | null;
    }) {
      const business = await deps.businessRepository.findActiveBySlug(input.businessSlug);
      if (!business) {
        return null;
      }

      const feedback = await deps.feedbackRepository.create({
        businessId: business.id,
        rating: input.rating,
        comment: input.comment?.trim() || null,
        customerPhone: input.customerPhone?.trim() || null,
      });

      if (shouldTriggerAlert(input.rating)) {
        try {
          const result = await deliverOwnerAlert({
            ownerEmail: business.ownerEmail,
            ownerWhatsApp: business.ownerWhatsApp,
            ownerSmsPhone: business.ownerSmsPhone ?? null,
            businessName: business.name,
            rating: input.rating,
            comment: input.comment,
            customerPhone: input.customerPhone,
            timestamp: feedback.createdAt,
          });

          if (result.phoneDelivered || result.emailDelivered) {
            await deps.feedbackRepository.markAlertSent(feedback.id);
          }
        } catch (error) {
          console.error("Failed to send owner alert", error);
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
