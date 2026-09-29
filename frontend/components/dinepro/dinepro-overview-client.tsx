"use client";

import { useCallback, useEffect, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { Card } from "@frontend/components/ui/card";
import { EmptyState } from "@frontend/components/ui/empty-state";
import { StatCard } from "@frontend/components/ui/stat-card";
import { Loader } from "@frontend/components/ui/loader";
import Link from "next/link";

type OverviewData = {
  totals: {
    feedbackToday: number;
    averageRating: number | null;
    averageRatingSample: number;
    activeTables: number;
    openIssues: number;
  };
  recentIssues: Array<{
    id: string;
    summary: string;
    category: string;
    severity: string;
    createdAt: string;
    table: { tableNumber: string };
  }>;
};

type ContextData = {
  business: { id: string; name: string; slug: string } | null;
  isPlatform: boolean;
};

export function DineProOverviewClient() {
  const [ctx, setCtx] = useState<ContextData | null>(null);
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState("");

  const load = useCallback(async (bid?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = bid ? `?businessId=${encodeURIComponent(bid)}` : "";
      const [cRes, oRes] = await Promise.all([
        fetch(`/api/dinepro/context${q}`),
        fetch(`/api/dinepro/overview${q}`),
      ]);
      const cJson = await cRes.json();
      if (!cRes.ok) throw new Error(cJson.error ?? "Context failed");
      setCtx(cJson);
      if (cJson.business?.id) setBusinessId(cJson.business.id);

      if (oRes.ok) {
        setData(await oRes.json());
      } else {
        const oJson = await oRes.json();
        setError(oJson.error ?? "Overview failed");
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DineProShell restaurantName={ctx?.business?.name}>
      {ctx?.isPlatform ? (
        <form
          className="mb-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load(businessId);
          }}
        >
          <input
            className="min-w-[280px] flex-1 rounded-xl border border-border px-3 py-2 text-sm"
            placeholder="Business UUID (platform admin)"
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
          />
          <button type="submit" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
            Load
          </button>
        </form>
      ) : null}

      {loading ? <Loader /> : null}
      {error ? (
        <EmptyState
          title="DinePro not ready"
          description={error}
          action={
            <Link href="/admin/dinepro/setup" className="text-sm font-medium text-brand">
              Open setup wizard
            </Link>
          }
        />
      ) : null}

      {data ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Today&apos;s overview</h1>
            <p className="text-sm text-muted">Know what happened at every table.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Feedback today" value={String(data.totals.feedbackToday)} />
            <StatCard
              label="Average rating"
              value={
                data.totals.averageRating == null
                  ? "—"
                  : `${data.totals.averageRating}/5`
              }
              hint={
                data.totals.averageRatingSample
                  ? `Based on ${data.totals.averageRatingSample} responses`
                  : "No responses yet"
              }
            />
            <StatCard label="Active tables" value={String(data.totals.activeTables)} />
            <StatCard label="Open issues" value={String(data.totals.openIssues)} />
          </div>

          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Recent issues</h2>
              <Link href="/admin/dinepro/issues" className="text-sm text-brand">
                View all
              </Link>
            </div>
            {data.recentIssues.length === 0 ? (
              <p className="text-sm text-muted">No open issues. Nice work.</p>
            ) : (
              <ul className="space-y-2">
                {data.recentIssues.map((issue) => (
                  <li
                    key={issue.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      Table {issue.table.tableNumber} · {issue.summary}
                    </span>
                    <span className="text-xs text-muted">
                      {issue.severity} · {issue.category}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/dinepro/floor"
              className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-sm)] hover:border-brand"
            >
              <p className="font-semibold">Live Floor</p>
              <p className="mt-1 text-sm text-muted">Visual table pulse with status labels.</p>
            </Link>
            <Link
              href="/admin/dinepro/qr"
              className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-sm)] hover:border-brand"
            >
              <p className="font-semibold">QR Manager</p>
              <p className="mt-1 text-sm text-muted">Generate and download table QR cards.</p>
            </Link>
          </div>
        </div>
      ) : null}
    </DineProShell>
  );
}
