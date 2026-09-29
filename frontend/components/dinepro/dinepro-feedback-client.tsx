"use client";

import { useCallback, useEffect, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { EmptyState } from "@frontend/components/ui/empty-state";
import { Loader } from "@frontend/components/ui/loader";

type Row = {
  id: string;
  overallRating: number;
  foodRating: number | null;
  serviceRating: number | null;
  comment: string | null;
  issueTags: string[];
  createdAt: string;
  table: { tableNumber: string };
};

export function DineProFeedbackClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([
        fetch("/api/dinepro/context"),
        fetch("/api/dinepro/feedback"),
      ]);
      const cj = await c.json();
      if (c.ok) setName(cj.business?.name);
      const fj = await f.json();
      if (!f.ok) throw new Error(fj.error ?? "Failed");
      setRows(fj.feedback);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <DineProShell restaurantName={name}>
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <p className="mt-1 text-sm text-muted">Recent table-linked guest responses.</p>
      {loading ? <Loader className="mt-4" /> : null}
      {error ? (
        <EmptyState className="mt-4" title="No feedback yet" description={error} />
      ) : null}
      {!loading && !error && rows.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="No feedback yet"
          description="Once guests scan a table QR, feedback will appear here."
        />
      ) : null}
      <ul className="mt-6 space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-border bg-white p-4 text-sm">
            <p className="font-medium">
              Table {row.table.tableNumber} · {row.overallRating}/5 overall
            </p>
            <p className="text-xs text-muted">
              Food {row.foodRating ?? "—"} · Service {row.serviceRating ?? "—"} ·{" "}
              {new Date(row.createdAt).toLocaleString()}
            </p>
            {row.comment ? <p className="mt-2 text-muted">{row.comment}</p> : null}
            {row.issueTags?.length ? (
              <p className="mt-1 text-xs text-brand">{row.issueTags.join(" · ")}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </DineProShell>
  );
}
