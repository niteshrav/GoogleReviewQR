import Link from "next/link";
import { businessService, feedbackService } from "@backend/lib/services/index";
import { countEntriesByDay } from "@backend/lib/reports/activity-by-day";
import { SendWeeklyReportButton } from "@frontend/components/admin/send-weekly-report-button";
import { Badge } from "@frontend/components/ui/badge";
import { Card } from "@frontend/components/ui/card";
import { StatCard } from "@frontend/components/ui/stat-card";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const businesses = await businessService.listBusinesses();
  const activeCount = businesses.filter((b) => b.isActive).length;
  const paidCount = businesses.filter((b) => b.billingStatus === "paid").length;
  const overdueCount = businesses.filter((b) => b.billingStatus === "overdue").length;
  const premiumCount = businesses.filter((b) => b.plan === "premium").length;

  const feedbackLists = await Promise.all(
    businesses.map(async (business) => ({
      business,
      items: await feedbackService.listFeedbackForBusiness(business.id),
    })),
  );

  const totalFeedback = feedbackLists.reduce((sum, e) => sum + e.items.length, 0);
  const googleClicks = feedbackLists.reduce(
    (sum, e) => sum + e.items.filter((i) => i.clickedGoogle).length,
    0,
  );
  const rated = feedbackLists.flatMap((e) =>
    e.items.filter((i) => typeof i.rating === "number"),
  );
  const avgRating =
    rated.length > 0
      ? (rated.reduce((s, i) => s + (i.rating ?? 0), 0) / rated.length).toFixed(1)
      : "—";

  const recentFeedback = feedbackLists
    .flatMap((e) =>
      e.items.map((i) => ({ ...i, businessName: e.business.name, businessId: e.business.id })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const recentBusinesses = [...businesses]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const allItems = feedbackLists.flatMap((e) => e.items);
  const activity = countEntriesByDay(allItems, 14);
  const maxActivity = Math.max(1, ...activity.map((b) => b.count));

  const billingBreakdown = [
    { label: "Trial", count: businesses.filter((b) => b.billingStatus === "trial").length, color: "bg-slate-300" },
    { label: "Invoiced", count: businesses.filter((b) => b.billingStatus === "invoiced").length, color: "bg-amber-400" },
    { label: "Paid", count: paidCount, color: "bg-emerald-500" },
    { label: "Overdue", count: overdueCount, color: "bg-red-400" },
  ].filter((r) => r.count > 0);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Admin dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {businesses.length} businesses · {activeCount} active · {paidCount} paid
            {premiumCount > 0 ? ` · ${premiumCount} premium` : ""}
            {overdueCount > 0 ? (
              <span className="ml-1.5 font-semibold text-red-500">{overdueCount} overdue</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SendWeeklyReportButton label="Send all weekly reports" />
          <Link
            href="/admin/businesses"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
          >
            Manage businesses →
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total businesses"
          value={businesses.length}
          hint={`${activeCount} active · ${businesses.length - activeCount} inactive`}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v1h1a1 1 0 010 2h-1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7H2a1 1 0 010-2h1V4zm2 3v9h8V7H6z" />
            </svg>
          }
        />
        <StatCard
          label="Feedback entries"
          value={totalFeedback}
          hint="All time across all businesses"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.8 8.8 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Avg private rating"
          value={avgRating}
          hint={rated.length ? `from ${rated.length} rated entries` : "No ratings yet"}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          }
        />
        <StatCard
          label="Google clicks"
          value={googleClicks}
          hint="Review taps logged from QR flow"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
          }
        />
      </section>

      {/* Activity chart + billing breakdown */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="lg">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">QR activity — last 14 days</h2>
              <p className="mt-0.5 text-xs text-muted">Private notes + Google taps per calendar day</p>
            </div>
            <Badge variant="brand" className="self-start">{premiumCount} premium</Badge>
          </div>
          <div className="mt-5 flex h-44 items-end gap-1.5 rounded-xl bg-slate-50 px-4 pb-3 pt-4">
            {activity.map((bucket) => {
              const pct = Math.max(6, (bucket.count / maxActivity) * 100);
              return (
                <div key={bucket.date} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div
                    className="w-full rounded-t-sm bg-brand/60 transition-all group-hover:bg-brand"
                    style={{ height: `${pct}%` }}
                  />
                  {bucket.count > 0 ? (
                    <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-navy px-1 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {bucket.count}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>{activity[0]?.date?.slice(5)}</span>
            <span>{activity[activity.length - 1]?.date?.slice(5)}</span>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Billing breakdown */}
          <Card padding="md">
            <h2 className="text-sm font-semibold text-foreground">Billing status</h2>
            <ul className="mt-4 space-y-2.5">
              {billingBreakdown.length === 0 ? (
                <li className="text-sm text-muted">No businesses yet.</li>
              ) : (
                billingBreakdown.map((row) => (
                  <li key={row.label} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
                      <span className="text-sm text-foreground">{row.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </Card>

          {/* Quick actions */}
          <Card padding="md">
            <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
            <ul className="mt-3 space-y-1.5">
              {[
                { href: "/admin/businesses", label: "Create business", icon: "+" },
                { href: "/admin/businesses", label: "Download QR codes", icon: "↓" },
                { href: "/admin/businesses", label: "UPI invoices", icon: "₹" },
                { href: "/admin/businesses", label: "Case studies", icon: "📄" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-slate-50"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm text-brand">
                      {item.icon}
                    </span>
                    {item.label}
                    <span className="ml-auto text-muted">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Recent activity tables */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card padding="none">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent feedback</h2>
            <p className="mt-0.5 text-xs text-muted">Latest private entries across all businesses</p>
          </div>
          {recentFeedback.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No feedback yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentFeedback.map((item) => {
                const stars = item.rating ?? null;
                const isLow = stars !== null && stars <= 3;
                return (
                  <li key={item.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50/60">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${isLow ? "bg-red-50 text-red-600" : "bg-brand-soft text-brand"}`}
                    >
                      {stars ?? "—"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground">{item.businessName}</p>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {item.comment?.trim() || (item.clickedGoogle ? "Google review tap" : "No comment")}
                      </p>
                    </div>
                    <p className="shrink-0 text-[11px] text-muted">
                      {item.createdAt.toLocaleDateString()}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card padding="none">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent businesses</h2>
              <p className="mt-0.5 text-xs text-muted">Newest pilots &amp; paying clients</p>
            </div>
            <Link href="/admin/businesses" className="text-xs font-medium text-brand hover:underline">
              View all →
            </Link>
          </div>
          {recentBusinesses.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No businesses yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentBusinesses.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                    {b.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{b.name}</p>
                    <p className="text-xs text-muted">/{b.slug}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={b.isActive ? "success" : "default"}>
                      {b.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant={b.plan === "premium" ? "brand" : "default"}>
                      {b.plan}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
