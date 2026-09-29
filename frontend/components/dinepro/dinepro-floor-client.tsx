"use client";

import { useCallback, useEffect, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { Card } from "@frontend/components/ui/card";
import { EmptyState } from "@frontend/components/ui/empty-state";
import { Loader } from "@frontend/components/ui/loader";
import { cn } from "@frontend/lib/cn";
import Link from "next/link";

type Cell = {
  id: string;
  tableNumber: string;
  floorName: string;
  status: "green" | "yellow" | "red" | "gray";
  statusLabel: string;
  healthScore: number;
  openIssueCount: number;
  latestOverallRating: number | null;
};

const statusStyles: Record<Cell["status"], string> = {
  green: "border-emerald-300 bg-emerald-50 text-emerald-900",
  yellow: "border-amber-300 bg-amber-50 text-amber-950",
  red: "border-red-300 bg-red-50 text-red-950",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
};

const statusIcon: Record<Cell["status"], string> = {
  green: "●",
  yellow: "▲",
  red: "■",
  gray: "○",
};

export function DineProFloorClient() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    health: { score: number; sampleSize: number };
    feedback: Array<{ overallRating: number; comment: string | null; createdAt: string }>;
    issues: Array<{ summary: string; status: string; severity: string }>;
    activities: Array<{ message: string; createdAt: string; type: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([
        fetch("/api/dinepro/context"),
        fetch("/api/dinepro/floor-pulse"),
      ]);
      const cj = await c.json();
      if (c.ok) setName(cj.business?.name);
      const fj = await f.json();
      if (!f.ok) throw new Error(fj.error ?? "Failed");
      setCells(fj.cells);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 30_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    void (async () => {
      const res = await fetch(`/api/dinepro/tables/${selected}`);
      const json = await res.json();
      if (res.ok) setDetail(json);
    })();
  }, [selected]);

  return (
    <DineProShell restaurantName={name}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Live Floor</h1>
          <p className="text-sm text-muted">Status uses color + icon + label for accessibility.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-border px-3 py-2 text-sm"
        >
          Refresh
        </button>
      </div>

      {loading && cells.length === 0 ? <Loader /> : null}
      {error ? (
        <EmptyState
          title="No floor data"
          description={error}
          action={
            <Link href="/admin/dinepro/setup" className="text-brand text-sm">
              Add tables in setup
            </Link>
          }
        />
      ) : null}

      {cells.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {cells.map((cell) => (
              <button
                key={cell.id}
                type="button"
                onClick={() => setSelected(cell.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  statusStyles[cell.status],
                  selected === cell.id ? "ring-2 ring-brand" : "",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">T{cell.tableNumber}</span>
                  <span aria-hidden>{statusIcon[cell.status]}</span>
                </div>
                <p className="mt-1 text-xs font-medium">{cell.statusLabel}</p>
                <p className="mt-2 text-[11px] opacity-80">
                  {cell.floorName} · Health {cell.healthScore}
                </p>
              </button>
            ))}
          </div>

          <Card className="p-5">
            {!selected ? (
              <p className="text-sm text-muted">Select a table for details, timeline, and issues.</p>
            ) : !detail ? (
              <Loader label="Loading table" />
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold">Table details</h2>
                  <p className="text-sm text-muted">
                    Health {detail.health.score}/100
                    {detail.health.sampleSize
                      ? ` · ${detail.health.sampleSize} samples`
                      : " · insufficient samples"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted">Latest feedback</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {detail.feedback.slice(0, 3).map((f, i) => (
                      <li key={i} className="rounded-xl bg-slate-50 px-3 py-2">
                        {f.overallRating}/5 {f.comment ? `— ${f.comment}` : ""}
                      </li>
                    ))}
                    {detail.feedback.length === 0 ? (
                      <li className="text-muted">No feedback yet</li>
                    ) : null}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted">Timeline</p>
                  <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-sm">
                    {detail.activities.map((a, i) => (
                      <li key={i} className="border-l-2 border-brand/30 pl-3">
                        <p>{a.message}</p>
                        <p className="text-[11px] text-muted">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </DineProShell>
  );
}
