"use client";

import { useCallback, useEffect, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { EmptyState } from "@frontend/components/ui/empty-state";
import { Loader } from "@frontend/components/ui/loader";
import { Button } from "@frontend/components/ui/button";

type Issue = {
  id: string;
  summary: string;
  category: string;
  severity: string;
  status: string;
  createdAt: string;
  table: { tableNumber: string };
};

export function DineProIssuesClient() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [name, setName] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, i] = await Promise.all([
        fetch("/api/dinepro/context"),
        fetch("/api/dinepro/issues"),
      ]);
      const cj = await c.json();
      if (c.ok) setName(cj.business?.name);
      const ij = await i.json();
      if (!i.ok) throw new Error(ij.error ?? "Failed");
      setIssues(ij.issues);
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

  async function setStatus(id: string, status: "IN_PROGRESS" | "RESOLVED") {
    await fetch(`/api/dinepro/issues/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        resolutionNote: status === "RESOLVED" ? "Resolved from dashboard" : undefined,
        resolvedBy: "manager",
      }),
    });
    await load();
  }

  return (
    <DineProShell restaurantName={name}>
      <h1 className="text-2xl font-semibold">Open issues</h1>
      <p className="mt-1 text-sm text-muted">Detect, assign, and resolve table-level problems.</p>
      {loading ? <Loader className="mt-4" /> : null}
      {error ? <EmptyState className="mt-4" title="No issues feed" description={error} /> : null}
      <ul className="mt-6 space-y-3">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                Table {issue.table.tableNumber} · {issue.summary}
              </p>
              <p className="text-xs text-muted">
                {issue.category} · {issue.severity} · {issue.status} ·{" "}
                {new Date(issue.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              {issue.status === "OPEN" ? (
                <Button type="button" size="sm" variant="outline" onClick={() => void setStatus(issue.id, "IN_PROGRESS")}>
                  Start
                </Button>
              ) : null}
              {issue.status !== "RESOLVED" ? (
                <Button type="button" size="sm" onClick={() => void setStatus(issue.id, "RESOLVED")}>
                  Resolve
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </DineProShell>
  );
}
