"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { EmptyState } from "@frontend/components/ui/empty-state";
import { Loader } from "@frontend/components/ui/loader";
import Link from "next/link";

type TableRow = {
  id: string;
  tableNumber: string;
  slug: string;
  isActive: boolean;
  status: string;
  qrUrl: string | null;
  floor: { name: string };
  branch: { name: string; slug: string };
};

export function DineProQrClient() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [q, setQ] = useState("");
  const [name, setName] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([
        fetch("/api/dinepro/context"),
        fetch("/api/dinepro/tables?includeInactive=1"),
      ]);
      const cj = await c.json();
      if (c.ok) setName(cj.business?.name);
      const tj = await t.json();
      if (!t.ok) throw new Error(tj.error ?? "Failed");
      setTables(tj.tables);
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

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tables;
    return tables.filter(
      (t) =>
        t.tableNumber.toLowerCase().includes(needle) ||
        t.floor.name.toLowerCase().includes(needle) ||
        t.branch.name.toLowerCase().includes(needle),
    );
  }, [tables, q]);

  async function deactivate(id: string) {
    await fetch(`/api/dinepro/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false, status: "inactive" }),
    });
    await load();
  }

  async function regenerate(id: string) {
    await fetch(`/api/dinepro/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateQr: true }),
    });
    await load();
  }

  function printCard(table: TableRow) {
    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Table ${table.tableNumber}</title>
      <style>
        body{font-family:system-ui,sans-serif;text-align:center;padding:32px}
        h1{font-size:28px;margin:0 0 8px}
        p{color:#5a6b7c}
        img{width:240px;height:240px;margin:24px auto;display:block}
      </style></head><body>
      <h1>TABLE ${table.tableNumber}</h1>
      <p>Scan to share your experience</p>
      <img src="/api/dinepro/tables/${table.id}/qr?preview=1" alt="QR" />
      <p>${table.branch.name} · ${table.floor.name}</p>
      <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  }

  return (
    <DineProShell restaurantName={name}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">QR Manager</h1>
          <p className="text-sm text-muted">Download, print, regenerate, or deactivate table QRs.</p>
        </div>
        <input
          className="rounded-xl border border-border px-3 py-2 text-sm"
          placeholder="Search table / floor"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {loading ? <Loader /> : null}
      {error ? (
        <EmptyState
          title="No tables yet"
          description={error}
          action={
            <Link href="/admin/dinepro/setup" className="text-sm text-brand">
              Run setup wizard
            </Link>
          }
        />
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-slate-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Table</th>
              <th className="px-4 py-3">Floor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-border/70">
                <td className="px-4 py-3 font-medium">T{t.tableNumber}</td>
                <td className="px-4 py-3">
                  {t.branch.name} / {t.floor.name}
                </td>
                <td className="px-4 py-3">{t.isActive ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <a
                      className="text-brand"
                      href={`/api/dinepro/tables/${t.id}/qr`}
                      download
                    >
                      Download
                    </a>
                    <button type="button" className="text-brand" onClick={() => printCard(t)}>
                      Print
                    </button>
                    <button type="button" className="text-muted" onClick={() => void regenerate(t.id)}>
                      Regenerate
                    </button>
                    {t.isActive ? (
                      <button
                        type="button"
                        className="text-error"
                        onClick={() => void deactivate(t.id)}
                      >
                        Deactivate
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DineProShell>
  );
}
