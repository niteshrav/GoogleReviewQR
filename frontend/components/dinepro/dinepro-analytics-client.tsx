"use client";

import { useCallback, useEffect, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { Card } from "@frontend/components/ui/card";
import { StatCard } from "@frontend/components/ui/stat-card";
import { Loader } from "@frontend/components/ui/loader";
import { EmptyState } from "@frontend/components/ui/empty-state";

type Analytics = {
  range: string;
  sampleSize: number;
  metrics: {
    totalFeedback: number;
    averageOverall: number | null;
    averageFood: number | null;
    averageService: number | null;
    averageAmbience: number | null;
    averageWaitTime: number | null;
    issueCount: number;
    resolutionRate: number | null;
  };
  mostReportedIssues: Array<{ category: string; count: number }>;
  tableStats: Array<{ tableNumber: string; average: number; count: number }>;
  menuPerformance: Array<{ name: string; average: number; count: number }>;
  insights: string[];
};

export function DineProAnalyticsClient() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<Analytics | null>(null);
  const [name, setName] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([
        fetch("/api/dinepro/context"),
        fetch(`/api/dinepro/analytics?range=${range}`),
      ]);
      const cj = await c.json();
      if (c.ok) setName(cj.business?.name);
      const aj = await a.json();
      if (!a.ok) throw new Error(aj.error ?? "Failed");
      setData(aj);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DineProShell restaurantName={name}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-sm text-muted">Sample counts shown — avoid over-reading small data.</p>
        </div>
        <select
          className="rounded-xl border border-border px-3 py-2 text-sm"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
        </select>
      </div>

      {loading ? <Loader /> : null}
      {error ? <EmptyState title="Analytics unavailable" description={error} /> : null}

      {data ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total feedback" value={data.metrics.totalFeedback} />
            <StatCard
              label="Overall"
              value={data.metrics.averageOverall ?? "—"}
              hint={`Based on ${data.sampleSize} responses`}
            />
            <StatCard label="Issues" value={data.metrics.issueCount} />
            <StatCard
              label="Resolution rate"
              value={
                data.metrics.resolutionRate == null
                  ? "—"
                  : `${data.metrics.resolutionRate}%`
              }
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Food" value={data.metrics.averageFood ?? "—"} />
            <StatCard label="Service" value={data.metrics.averageService ?? "—"} />
            <StatCard label="Ambience" value={data.metrics.averageAmbience ?? "—"} />
            <StatCard label="Wait time" value={data.metrics.averageWaitTime ?? "—"} />
          </div>

          <Card className="p-5">
            <h2 className="font-semibold">Insights</h2>
            {data.insights.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Not enough data yet for pattern insights.
              </p>
            ) : (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {data.insights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-semibold">Most reported issues</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.mostReportedIssues.map((i) => (
                  <li key={i.category} className="flex justify-between">
                    <span>{i.category}</span>
                    <span className="text-muted">{i.count}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-5">
              <h2 className="font-semibold">Menu performance</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {data.menuPerformance.length === 0 ? (
                  <li className="text-muted">No menu ratings yet</li>
                ) : (
                  data.menuPerformance.map((m) => (
                    <li key={m.name} className="flex justify-between">
                      <span>{m.name}</span>
                      <span>
                        {m.average} ★ <span className="text-muted">({m.count})</span>
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </Card>
          </div>
        </div>
      ) : null}
    </DineProShell>
  );
}
