import { notFound } from "next/navigation";
import { planLabel } from "@backend/lib/billing/manual-pricing";
import { getLastNDaysWindow, pickCaseStudyQuote } from "@backend/lib/reports/case-study";
import { summarizeFeedbackWeek } from "@backend/lib/reports/weekly-summary";
import { businessService, feedbackService } from "@backend/lib/services/index";
import { CaseStudyOnePager } from "@frontend/components/admin/case-study-one-pager";
import type { BillingPlan } from "@database/types";

export const dynamic = "force-dynamic";

type CaseStudyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCaseStudyPage({ params }: CaseStudyPageProps) {
  const { id } = await params;
  const business = await businessService.getBusinessById(id);

  if (!business) {
    notFound();
  }

  const window = getLastNDaysWindow(30);
  const items = await feedbackService.listFeedbackForBusiness(business.id);
  const summary = summarizeFeedbackWeek(items, window);
  const quote = pickCaseStudyQuote(items);
  const plan = (business.plan as BillingPlan | undefined) ?? "pilot";

  return (
    <CaseStudyOnePager
      businessName={business.name}
      slug={business.slug}
      periodLabel={`${window.start.toISOString().slice(0, 10)} to ${window.end.toISOString().slice(0, 10)}`}
      googleClicks={summary.googleClicks}
      privateFeedback={summary.privateFeedback}
      alertsSent={summary.alertsSent}
      averageRating={summary.averageRating == null ? "—" : `${summary.averageRating}/5`}
      quote={quote}
      planLabel={planLabel(plan)}
    />
  );
}
