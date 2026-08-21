"use client";

import { FormEvent, useEffect, useState } from "react";
import { Alert } from "@frontend/components/ui/alert";
import { Badge } from "@frontend/components/ui/badge";
import { Button } from "@frontend/components/ui/button";
import { Card } from "@frontend/components/ui/card";
import { Input } from "@frontend/components/ui/input";

export type AdminPlan = {
  id: string;
  key: string;
  name: string;
  tagline: string | null;
  priceInr: number;
  setupFeeInr: number;
  features: string[];
  highlighted: boolean;
  isPublic: boolean;
  sortOrder: number;
};

type PlanFormState = {
  key: string;
  name: string;
  tagline: string;
  priceInr: string;
  setupFeeInr: string;
  featuresText: string;
  highlighted: boolean;
  isPublic: boolean;
  sortOrder: string;
};

const emptyForm: PlanFormState = {
  key: "",
  name: "",
  tagline: "",
  priceInr: "499",
  setupFeeInr: "2999",
  featuresText: "Feature one\nFeature two\nFeature three",
  highlighted: false,
  isPublic: true,
  sortOrder: "10",
};

function toForm(plan: AdminPlan): PlanFormState {
  return {
    key: plan.key,
    name: plan.name,
    tagline: plan.tagline ?? "",
    priceInr: String(plan.priceInr),
    setupFeeInr: String(plan.setupFeeInr),
    featuresText: plan.features.join("\n"),
    highlighted: plan.highlighted,
    isPublic: plan.isPublic,
    sortOrder: String(plan.sortOrder),
  };
}

function parseFeatures(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AdminPlansClient({ initialPlans }: { initialPlans: AdminPlan[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function startEdit(plan: AdminPlan) {
    setEditingId(plan.id);
    setForm(toForm(plan));
    setError(null);
  }

  async function refresh() {
    const response = await fetch("/api/admin/plans", { credentials: "include" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as { plans: AdminPlan[] };
    setPlans(data.plans);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const features = parseFeatures(form.featuresText);
    if (features.length === 0) {
      setError("Add at least one feature (one per line).");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      priceInr: Number(form.priceInr),
      setupFeeInr: Number(form.setupFeeInr),
      features,
      highlighted: form.highlighted,
      isPublic: form.isPublic,
      sortOrder: Number(form.sortOrder),
      ...(editingId
        ? {}
        : {
            key: form.key.trim().toLowerCase(),
          }),
    };

    const response = await fetch(
      editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans",
      {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not save plan");
      setSaving(false);
      return;
    }

    await refresh();
    startCreate();
    setSaving(false);
  }

  async function handleDelete(plan: AdminPlan) {
    if (!window.confirm(`Delete plan “${plan.name}”? Businesses using this key keep the key string.`)) {
      return;
    }

    const response = await fetch(`/api/admin/plans/${plan.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not delete plan");
      return;
    }

    if (editingId === plan.id) {
      startCreate();
    }
    await refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        {plans.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">No plans yet. Create the first subscription plan.</p>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <Badge variant="default">{plan.key}</Badge>
                    {plan.highlighted ? <Badge variant="brand">Highlighted</Badge> : null}
                    <Badge variant={plan.isPublic ? "success" : "warning"}>
                      {plan.isPublic ? "Public" : "Hidden"}
                    </Badge>
                  </div>
                  {plan.tagline ? (
                    <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
                  ) : null}
                </div>
                <p className="text-xl font-semibold text-brand">
                  {plan.priceInr === 0 ? "Free" : `₹${plan.priceInr}/mo`}
                </p>
              </div>
              <ul className="space-y-1 text-sm text-muted">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <p className="text-xs text-muted">
                Setup fee ₹{plan.setupFeeInr} · Sort {plan.sortOrder}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit(plan)}>
                  Edit
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => handleDelete(plan)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">
              {editingId ? "Edit plan" : "Create plan"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Public plans appear on the homepage pricing section.
            </p>
          </div>
          {editingId ? (
            <Button type="button" size="sm" variant="ghost" onClick={startCreate}>
              New
            </Button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {!editingId ? (
            <Input
              id="plan-key"
              label="Key"
              required
              value={form.key}
              onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))}
              placeholder="core"
              hint="Lowercase slug used on businesses (e.g. pilot, core, premium)"
            />
          ) : (
            <p className="text-sm text-muted">
              Key: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{form.key}</code>
            </p>
          )}

          <Input
            id="plan-name"
            label="Name"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />

          <Input
            id="plan-tagline"
            label="Tagline"
            value={form.tagline}
            onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="plan-price"
              label="Monthly price (INR)"
              type="number"
              min={0}
              required
              value={form.priceInr}
              onChange={(event) =>
                setForm((current) => ({ ...current, priceInr: event.target.value }))
              }
            />
            <Input
              id="plan-setup"
              label="Setup fee (INR)"
              type="number"
              min={0}
              required
              value={form.setupFeeInr}
              onChange={(event) =>
                setForm((current) => ({ ...current, setupFeeInr: event.target.value }))
              }
            />
          </div>

          <Input
            id="plan-sort"
            label="Sort order"
            type="number"
            min={0}
            required
            value={form.sortOrder}
            onChange={(event) =>
              setForm((current) => ({ ...current, sortOrder: event.target.value }))
            }
          />

          <div>
            <label htmlFor="plan-features" className="mb-1.5 block text-sm font-medium">
              Features (one per line)
            </label>
            <textarea
              id="plan-features"
              required
              rows={5}
              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)]"
              value={form.featuresText}
              onChange={(event) =>
                setForm((current) => ({ ...current, featuresText: event.target.value }))
              }
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(event) =>
                setForm((current) => ({ ...current, isPublic: event.target.checked }))
              }
            />
            Show on homepage
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.highlighted}
              onChange={(event) =>
                setForm((current) => ({ ...current, highlighted: event.target.checked }))
              }
            />
            Highlight as recommended
          </label>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button type="submit" loading={saving} fullWidth>
            {editingId ? "Save changes" : "Create plan"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
