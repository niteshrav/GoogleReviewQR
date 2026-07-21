import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { feedbackService } from "@backend/lib/services/index";
import { FeedbackTable } from "@frontend/components/admin/feedback-table";

export const dynamic = "force-dynamic";

type AdminFeedbackPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminFeedbackPage({ params }: AdminFeedbackPageProps) {
  const { id } = await params;
  const business = await businessService.getBusinessById(id);

  if (!business) {
    notFound();
  }

  const feedback = await feedbackService.listFeedbackForBusiness(business.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Feedback — {business.name}
          </h1>
        </div>
        <Link href="/admin/businesses" className="text-sm text-brand hover:underline">
          Back to businesses
        </Link>
      </div>

      <div className="mt-8">
        <FeedbackTable
          items={feedback.map((item) => ({
            id: item.id,
            rating: item.rating,
            comment: item.comment,
            clickedGoogle: item.clickedGoogle,
            alertSentAt: item.alertSentAt?.toISOString() ?? null,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
