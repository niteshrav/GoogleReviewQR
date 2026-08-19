import Link from "next/link";
import { notFound } from "next/navigation";
import { businessService } from "@backend/lib/services/index";
import { feedbackService } from "@backend/lib/services/index";
import { FeedbackTable } from "@frontend/components/admin/feedback-table";
import { Badge } from "@frontend/components/ui/badge";
import { Card } from "@frontend/components/ui/card";

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

  let feedback: Awaited<ReturnType<typeof feedbackService.listFeedbackForBusiness>> = [];
  let loadError: string | null = null;

  try {
    feedback = await feedbackService.listFeedbackForBusiness(business.id);
  } catch (error) {
    console.error("[admin/feedback] failed to list feedback", error);
    loadError = "Could not load feedback from the database.";
  }
  const rated = feedback.filter((item) => typeof item.rating === "number");
  const avg =
    rated.length > 0
      ? (rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";
  const googleClicks = feedback.filter((item) => item.clickedGoogle).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Feedback — {business.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={business.isActive ? "success" : "default"}>
              {business.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="brand">/{business.slug}</Badge>
          </div>
        </div>
        <Link
          href="/admin/businesses"
          className="text-sm font-medium text-brand hover:underline"
        >
          ← Back to businesses
        </Link>
      </div>

      {loadError ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">{loadError}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Total entries</p>
          <p className="mt-2 text-3xl font-semibold">{feedback.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Average rating</p>
          <p className="mt-2 text-3xl font-semibold">{avg}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Google clicks</p>
          <p className="mt-2 text-3xl font-semibold">{googleClicks}</p>
        </Card>
      </section>

      <FeedbackTable
        items={feedback.map((item) => ({
          id: item.id,
          rating: item.rating,
          comment: item.comment,
          customerName: item.customerName,
          customerPhone: item.customerPhone,
          clickedGoogle: item.clickedGoogle,
          alertSentAt: item.alertSentAt ? new Date(item.alertSentAt).toISOString() : null,
          createdAt: new Date(item.createdAt).toISOString(),
        }))}
      />
    </div>
  );
}
