"use client";

import { FormEvent, useEffect, useState } from "react";
import { DineProShell } from "@frontend/components/dinepro/dinepro-shell";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";
import { Card } from "@frontend/components/ui/card";

type Branch = {
  id: string;
  name: string;
  slug: string;
  floors: Array<{ id: string; name: string; slug: string }>;
};

export function DineProSetupClient() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [branchName, setBranchName] = useState("Main");
  const [floorName, setFloorName] = useState("Ground Floor");
  const [tableCount, setTableCount] = useState("10");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const res = await fetch("/api/dinepro/context");
    const json = await res.json();
    if (res.ok) {
      setBusinessName(json.business?.name ?? "");
      setBusinessId(json.business?.id ?? "");
      setBranches(json.branches ?? []);
    } else {
      setError(json.error ?? "Load failed — assign DinePro plan to this business first.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addBranch(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/dinepro/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: branchName, businessId: businessId || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessage(`Branch “${json.branch.name}” created`);
      setStep(3);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addFloor(e: FormEvent) {
    e.preventDefault();
    const branchId = branches[0]?.id;
    if (!branchId) {
      setError("Create a branch first");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/dinepro/floors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, name: floorName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessage(`Floor “${json.floor.name}” created`);
      setStep(4);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addTables(e: FormEvent) {
    e.preventDefault();
    const floorId = branches[0]?.floors[0]?.id;
    if (!floorId) {
      setError("Create a floor first");
      return;
    }
    setBusy(true);
    try {
      const n = Math.min(50, Math.max(1, Number(tableCount) || 1));
      for (let i = 1; i <= n; i++) {
        const num = String(i).padStart(2, "0");
        const res = await fetch("/api/dinepro/tables", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ floorId, tableNumber: num, slug: `t${num}` }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? `Table ${num} failed`);
      }
      setMessage(`${n} tables created with QR codes`);
      setStep(6);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <DineProShell restaurantName={businessName || undefined}>
      <h1 className="text-2xl font-semibold">Restaurant setup</h1>
      <p className="mt-1 text-sm text-muted">Six steps to start collecting table-level feedback.</p>

      <ol className="mt-4 flex flex-wrap gap-2 text-xs">
        {["Details", "Branch", "Floor", "Tables", "QR", "Ready"].map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 ${
              step === i + 1 ? "bg-brand text-white" : "bg-slate-100 text-muted"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      {message ? <p className="mt-4 text-sm text-success">{message}</p> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">1. Restaurant details</h2>
          <p className="text-sm text-muted">
            Uses your existing trustTap business profile
            {businessName ? (
              <>
                : <strong>{businessName}</strong>
              </>
            ) : (
              ". Assign plan key dinepro in admin first."
            )}
          </p>
          <Button type="button" onClick={() => setStep(2)} disabled={!businessId}>
            Continue
          </Button>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">2. Add branch</h2>
          <form onSubmit={addBranch} className="space-y-3">
            <Input value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
            <Button type="submit" disabled={busy || !businessId}>
              Save branch
            </Button>
          </form>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">3. Add floor</h2>
          <form onSubmit={addFloor} className="space-y-3">
            <Input value={floorName} onChange={(e) => setFloorName(e.target.value)} required />
            <Button type="submit" disabled={busy || branches.length === 0}>
              Save floor
            </Button>
          </form>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-semibold">4–5. Add tables + generate QR</h2>
          <form onSubmit={addTables} className="space-y-3">
            <label className="text-sm text-muted">How many tables?</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={tableCount}
              onChange={(e) => setTableCount(e.target.value)}
            />
            <Button type="submit" disabled={busy || !branches[0]?.floors?.length}>
              Create tables & QR
            </Button>
          </form>
        </Card>

        <Card className="space-y-3 p-5 lg:col-span-2">
          <h2 className="font-semibold">6. Ready</h2>
          <p className="text-sm text-muted">
            Download printable QR cards from QR Manager, place them on tables, and watch Live Floor.
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
