import Link from "next/link";
import { businessService, feedbackService } from "@backend/lib/services/index";
import { Badge } from "@frontend/components/ui/badge";
import { Card } from "@frontend/components/ui/card";
import { StatCard } from "@frontend/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const businesses = await businessService.listBusinesses();
  const activeCount = businesses.filter((b) => b.isActive).length;

  const feedbackLists = await Promise.all(
    businesses.map(async (business) => ({
      business,
      items: await feedbackService.listFeedbackForBusiness(business.id),
    })),
  );

  const totalFeedback = feedbackLists.reduce((sum, entry) => sum + entry.items.length, 0);
  const googleClicks = feedbackLists.reduce(
    (sum, entry) => sum + entry.items.filter((item) => item.clickedGoogle).length,
    0,
  );
  const rated = feedbackLists.flatMap((entry) =>
    entry.items.filter((item) => typeof item.rating === "number"),
  );
  const avgRating =
    rated.length > 0
      ? (rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";

  const recentFeedback = feedbackLists
    .flatMap((entry) =>
      entry.items.map((item) => ({
        ...item,
        businessName: entry.business.name,
        businessId: entry.business.id,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const recentBusinesses = [...businesses]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            Manage pilot businesses, review feedback, and export QR codes.
          </p>
        </div>
        <Link
          href="/admin/businesses"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
        >
          Manage businesses
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Businesses"
          value={businesses.length}
          hint={`${activeCount} active`}
          icon={<span>▣</span>}
        />
        <StatCard
          label="Feedback entries"
          value={totalFeedback}
          hint="All time"
          icon={<span>◎</span>}
        />
        <StatCard
          label="Avg rating"
          value={avgRating}
          hint={rated.length ? `${rated.length} rated responses` : "No ratings yet"}
          icon={<span>★</span>}
        />
        <StatCard
          label="Google clicks"
          value={googleClicks}
          hint="Logged from QR flow"
          icon={<span>↗</span>}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Activity overview</h2>
              <p className="mt-1 text-sm text-muted">Graph placeholder for Phase 2 analytics</p>
            </div>
            <Badge variant="brand">Coming soon</Badge>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2 rounded-xl bg-slate-50 p-4">
            {[42, 65, 38, 80, 55, 72, 48, 90, 60, 78, 50, 88].map((height, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-md bg-gradient-to-t from-brand/70 to-brand/30"
                style={{ height: `${height}%` }}
                aria-hidden
              />
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Quick actions</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                href="/admin/businesses"
                className="flex items-center justify-between rounded-xl border border-border px-3 py-3 text-sm hover:bg-slate-50"
              >
                Create business
                <span className="text-muted">→</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/businesses"
                className="flex items-center justify-between rounded-xl border border-border px-3 py-3 text-sm hover:bg-slate-50"
              >
                Export QR codes
                <span className="text-muted">→</span>
              </Link>
            </li>
            <li>
              <a
                href="/api/health"
                className="flex items-center justify-between rounded-xl border border-border px-3 py-3 text-sm hover:bg-slate-50"
              >
                System health
                <span className="text-muted">→</span>
              </a>
            </li>
          </ul>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card padding="none">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">Recent reviews</h2>
            <p className="mt-1 text-sm text-muted">Latest private feedback across businesses</p>
          </div>
          {recentFeedback.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted">No feedback yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentFeedback.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{item.businessName}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.comment?.trim()
                          ? item.comment
                          : item.clickedGoogle
                            ? "Google review click"
                            : "No comment"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-brand">
                        {item.rating ? `${item.rating}/5` : "—"}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {item.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padding="none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Recent businesses</h2>
              <p className="mt-1 text-sm text-muted">Newest merchants in your pilot</p>
            </div>
            <Link href="/admin/businesses" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {recentBusinesses.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted">No businesses yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentBusinesses.map((business) => (
                <li key={business.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                      {business.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{business.name}</p>
                      <p className="text-xs text-muted">/{business.slug}</p>
                    </div>
                  </div>
                  <Badge variant={business.isActive ? "success" : "default"}>
                    {business.isActive ? "Active" : "Inactive"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
