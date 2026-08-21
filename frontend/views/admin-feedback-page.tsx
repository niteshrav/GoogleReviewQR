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

  const alertsSent = feedback.filter((item) => item.alertSentAt).length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/businesses"
              className="text-xs font-medium text-muted hover:text-brand"
            >
              ← Businesses
            </Link>
            <span className="text-xs text-muted">/</span>
            <span className="text-xs text-muted">{business.name}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Feedback log
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={business.isActive ? "success" : "default"}>
              {business.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="brand">/{business.slug}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/api/admin/feedback/export?businessId=${business.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-background"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-muted">
              <path d="M8 1a.75.75 0 01.75.75v5.5h1.5a.25.25 0 01.177.427l-2.25 2.25a.25.25 0 01-.354 0l-2.25-2.25A.25.25 0 015.75 7.25h1.5v-5.5A.75.75 0 018 1zM3.5 12.75a.75.75 0 000 1.5h9a.75.75 0 000-1.5h-9z" />
            </svg>
            Export CSV
          </Link>
          <Link
            href={`/admin/businesses/${business.id}/one-pager`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-background"
          >
            Staff one-pager
          </Link>
          <Link
            href={`/admin/businesses/${business.id}/invoice`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            UPI invoice
          </Link>
          <Link
            href={`/admin/businesses/${business.id}/case-study`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-background"
          >
            Case study
          </Link>
        </div>
      </div>

      {loadError ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">{loadError}</p>
        </Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total entries</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{feedback.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Avg rating</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{avg}</p>
          <p className="mt-1 text-xs text-muted">{rated.length} rated</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Google clicks</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{googleClicks}</p>
          <p className="mt-1 text-xs text-muted">
            {feedback.length > 0
              ? `${Math.round((googleClicks / feedback.length) * 100)}% conversion`
              : "No data"}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Alerts sent</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{alertsSent}</p>
          <p className="mt-1 text-xs text-muted">WhatsApp / SMS / email</p>
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
          alertChannel: item.alertChannel ?? null,
          createdAt: new Date(item.createdAt).toISOString(),
        }))}
      />
    </div>
  );
}
