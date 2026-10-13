"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Card } from "@frontend/components/ui/card";

type Floor = { id: string; name: string; slug: string };
type Branch = { id: string; name: string; slug: string; floors: Floor[] };
type Table = { id: string; tableNumber: string; slug: string; floorId: string; branchId: string };

const selectClass =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)]";

/** Next free numbers for `prefix` on a floor, skipping table numbers / slugs already taken. */
function planTables(prefix: string, count: number, floorId: string, branchId: string, tables: Table[]) {
  const pre = prefix.trim().toUpperCase();
  const onFloor = tables.filter((t) => t.floorId === floorId);
  const usedNumbers = new Set(onFloor.map((t) => t.tableNumber.toUpperCase()));
  const usedSlugs = new Set(tables.filter((t) => t.branchId === branchId).map((t) => t.slug));
  let n = 0;
  for (const t of onFloor) {
    const upper = t.tableNumber.toUpperCase();
    if (!upper.startsWith(pre)) continue;
    const rest = upper.slice(pre.length);
    if (/^\d+$/.test(rest)) n = Math.max(n, Number(rest));
  }

  const planned: Array<{ tableNumber: string; slug: string }> = [];
  while (planned.length < count && n < 999) {
    n += 1;
    const tableNumber = `${pre}${String(n).padStart(2, "0")}`;
    const slug = (pre ? tableNumber : `t${tableNumber}`).toLowerCase();
    if (usedNumbers.has(tableNumber) || usedSlugs.has(slug)) continue;
    planned.push({ tableNumber, slug });
  }
  return planned;
}

export function DineProSetupClient() {
  const [businessName, setBusinessName] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [branchId, setBranchId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [branchName, setBranchName] = useState("Main");
  const [floorName, setFloorName] = useState("Ground Floor");
  const [tablePrefix, setTablePrefix] = useState("");
  const [tableCount, setTableCount] = useState("10");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async (select?: { branchId?: string; floorId?: string }) => {
    const [cRes, tRes] = await Promise.all([
      fetch("/api/dinepro/context"),
      fetch("/api/dinepro/tables?includeInactive=1"),
    ]);
    const cJson = await cRes.json();
    setLoaded(true);
    if (!cRes.ok) {
      setError(cJson.error ?? "Could not load restaurant. Set the business plan to DinePro first.");
      return;
    }
    const nextBranches: Branch[] = cJson.branches ?? [];
    setBusinessName(cJson.business?.name ?? "");
    setBranches(nextBranches);
    if (tRes.ok) setTables(((await tRes.json()).tables ?? []) as Table[]);

    setBranchId((current) => {
      const wanted = select?.branchId ?? current;
      return nextBranches.some((b) => b.id === wanted) ? wanted : (nextBranches[0]?.id ?? "");
    });
    if (select?.floorId) setFloorId(select.floorId);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const branch = branches.find((b) => b.id === branchId);
  const floors = branch?.floors ?? [];

  useEffect(() => {
    if (!floors.some((f) => f.id === floorId)) setFloorId(floors[0]?.id ?? "");
  }, [floors, floorId]);

  const count = Math.min(50, Math.max(1, Number(tableCount) || 1));
  const planned = useMemo(
    () => (floorId && branchId ? planTables(tablePrefix, count, floorId, branchId, tables) : []),
    [tablePrefix, count, floorId, branchId, tables],
  );
  const tablesOnFloor = tables.filter((t) => t.floorId === floorId).length;

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Request failed");
    return json;
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  function addBranch(e: FormEvent) {
    e.preventDefault();
    void run(async () => {
      const json = await post("/api/dinepro/branches", { name: branchName });
      setMessage(`Branch “${json.branch.name}” added`);
      await refresh({ branchId: json.branch.id });
    });
  }

  function addFloor(e: FormEvent) {
    e.preventDefault();
    if (!branchId) return setError("Add a branch first");
    void run(async () => {
      const json = await post("/api/dinepro/floors", { branchId, name: floorName });
      setMessage(`Floor “${json.floor.name}” added`);
      await refresh({ branchId, floorId: json.floor.id });
    });
  }

  function addTables(e: FormEvent) {
    e.preventDefault();
    if (!floorId) return setError("Add a floor first");
    void run(async () => {
      let created = 0;
      try {
        for (const t of planned) {
          await post("/api/dinepro/tables", { floorId, tableNumber: t.tableNumber, slug: t.slug });
          created += 1;
        }
      } finally {
        await refresh();
      }
      setMessage(
        `${created} table${created === 1 ? "" : "s"} created (${planned[0]?.tableNumber}–${planned[planned.length - 1]?.tableNumber}). QR codes are ready in QR Manager.`,
      );
    });
  }

  return (
    <DineProShell restaurantName={businessName || undefined}>
      <h1 className="text-2xl font-semibold">Restaurant setup</h1>
      <p className="mt-1 text-sm text-muted">
        Add branches, floors and tables. Each table gets its own QR code automatically.
      </p>

      {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">1. Restaurant</h2>
          <p className="text-sm text-muted">
            {businessName ? (
              <>
                Setting up <strong className="text-foreground">{businessName}</strong>.
              </>
            ) : loaded ? (
              "No DinePro restaurant found. In Admin → Businesses, set the business plan to DinePro."
            ) : (
              "Loading…"
            )}
          </p>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">2. Branch</h2>
          {branches.length > 0 ? (
            <select
              className={selectClass}
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              aria-label="Branch"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : null}
          <form onSubmit={addBranch} className="flex gap-2">
            <Input
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
              aria-label="New branch name"
            />
            <Button type="submit" variant="outline" disabled={busy || !businessName}>
              Add branch
            </Button>
          </form>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">3. Floor</h2>
          {floors.length > 0 ? (
            <select
              className={selectClass}
              value={floorId}
              onChange={(e) => setFloorId(e.target.value)}
              aria-label="Floor"
            >
              {floors.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-muted">
              {branchId ? "No floors in this branch yet." : "Add a branch first."}
            </p>
          )}
          <form onSubmit={addFloor} className="flex gap-2">
            <Input
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              required
              aria-label="New floor name"
            />
            <Button type="submit" variant="outline" disabled={busy || !branchId}>
              Add floor
            </Button>
          </form>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">4. Tables + QR codes</h2>
          <p className="text-sm text-muted">
            {floorId
              ? `${tablesOnFloor} table${tablesOnFloor === 1 ? "" : "s"} on this floor already.`
              : "Pick or add a floor first."}
          </p>
          <form onSubmit={addTables} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Prefix (optional)"
                value={tablePrefix}
                maxLength={4}
                onChange={(e) => setTablePrefix(e.target.value.replace(/[^a-zA-Z]/g, ""))}
                placeholder="e.g. R"
              />
              <Input
                label="How many?"
                type="number"
                min={1}
                max={50}
                value={tableCount}
                onChange={(e) => setTableCount(e.target.value)}
              />
            </div>
            {planned.length > 0 ? (
              <p className="text-xs text-muted">
                Will create {planned[0].tableNumber}
                {planned.length > 1 ? `–${planned[planned.length - 1].tableNumber}` : ""}
              </p>
            ) : null}
            <Button type="submit" disabled={busy || !floorId || planned.length === 0}>
              {busy ? "Creating…" : "Create tables & QR"}
            </Button>
          </form>
        </Card>

        <Card className="space-y-3 p-5 lg:col-span-2">
          <h2 className="font-semibold">5. Ready</h2>
          <p className="text-sm text-muted">
            Download or print QR cards from QR Manager, place them on tables, and watch Live Floor.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href="/admin/dinepro/qr">
              <Button type="button">Open QR Manager</Button>
            </a>
            <a href="/admin/dinepro/floor">
              <Button type="button" variant="outline">
                Open Live Floor
              </Button>
            </a>
          </div>
        </Card>
      </div>
    </DineProShell>
  );
}
