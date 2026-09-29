"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { EmptyState } from "@frontend/components/ui/empty-state";
import { Loader } from "@frontend/components/ui/loader";

type Item = { id: string; name: string; category: string | null };

export function DineProMenuClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [restaurant, setRestaurant] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perf, setPerf] = useState<Array<{ name: string; average: number; count: number }>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, m, a] = await Promise.all([
        fetch("/api/dinepro/context"),
        fetch("/api/dinepro/menu"),
        fetch("/api/dinepro/analytics?range=30d"),
      ]);
      const cj = await c.json();
      if (c.ok) setRestaurant(cj.business?.name);
      const mj = await m.json();
      if (!m.ok) throw new Error(mj.error);
      setItems(mj.items);
      if (a.ok) {
        const aj = await a.json();
        setPerf(aj.menuPerformance ?? []);
      }
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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/dinepro/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category: category || null }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Create failed");
      return;
    }
    setName("");
    setCategory("");
    await load();
  }

  return (
    <DineProShell restaurantName={restaurant}>
      <h1 className="text-2xl font-semibold">Menu insights</h1>
      <p className="mt-1 text-sm text-muted">Optional dish ratings from the guest dine flow.</p>

      <form onSubmit={onCreate} className="mt-4 flex flex-wrap gap-2">
        <Input
          placeholder="Menu item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Button type="submit">Add item</Button>
      </form>

      {loading ? <Loader className="mt-4" /> : null}
      {error ? <EmptyState className="mt-4" title="Menu unavailable" description={error} /> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="font-semibold">Menu items</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between border-b border-border/60 py-2">
                <span>{item.name}</span>
                <span className="text-muted">{item.category ?? "—"}</span>
              </li>
            ))}
            {items.length === 0 ? <li className="text-muted">No items yet</li> : null}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="font-semibold">Performance</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {perf.map((p) => (
              <li key={p.name} className="flex justify-between">
                <span>{p.name}</span>
                <span>
                  {p.average} ★ <span className="text-muted">({p.count})</span>
                </span>
              </li>
            ))}
            {perf.length === 0 ? (
              <li className="text-muted">No ratings yet</li>
            ) : null}
          </ul>
        </div>
      </div>
    </DineProShell>
  );
}
