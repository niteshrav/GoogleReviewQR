import { sendPhoneAlert } from "@backend/lib/phone/send-phone-alert";
import { sendWeeklyReportEmail } from "@backend/lib/email/smtp";
import {
  formatWeeklyReportMessage,
  getLastSevenDaysWindow,
  summarizeFeedbackWeek,
} from "@backend/lib/reports/weekly-summary";
import { businessService, feedbackService } from "@backend/lib/services/index";
import type { BillingPlan } from "@database/types";

export type SendWeeklyReportsOptions = {
  now?: Date;
  force?: boolean;
  businessId?: string;
};

export async function sendWeeklyReports(options: SendWeeklyReportsOptions = {}) {
  const now = options.now ?? new Date();
  const window = getLastSevenDaysWindow(now);
  const listed = options.businessId
    ? [await businessService.getBusinessById(options.businessId)]
    : await businessService.listBusinesses();
  const businesses = listed.filter((business) => Boolean(business));

  const results: Array<{ businessId: string; slug: string; sent: boolean }> = [];

  for (const business of businesses) {
    if (!business) {
      continue;
    }

    if (!options.businessId && !business.isActive) {
      continue;
    }

    if (!options.force && business.lastWeeklyReportAt) {
      const elapsed = now.getTime() - business.lastWeeklyReportAt.getTime();
      if (elapsed < 6 * 24 * 60 * 60 * 1000) {
        results.push({ businessId: business.id, slug: business.slug, sent: false });
        continue;
      }
    }

    const items = await feedbackService.listFeedbackForBusiness(business.id);
    const summary = summarizeFeedbackWeek(items, window);
    const plan = (business.plan as BillingPlan | undefined) ?? "core";
    const message = formatWeeklyReportMessage(business.name, summary, plan);

    try {
      await sendPhoneAlert({
        ownerWhatsApp: business.ownerWhatsApp,
        ownerSmsPhone: business.ownerSmsPhone,
        message,
      });
    } catch (error) {
      console.error(`Weekly phone report failed for ${business.slug}`, error);
    }

    try {
      await sendWeeklyReportEmail({
        to: business.ownerEmail,
        businessName: business.name,
        body: message,
      });
    } catch (error) {
      console.error(`Weekly email report failed for ${business.slug}`, error);
    }

    await businessService.updateBusiness(business.id, { lastWeeklyReportAt: now });
    results.push({ businessId: business.id, slug: business.slug, sent: true });
  }

  return { window, sent: results.filter((item) => item.sent).length, results };
}
