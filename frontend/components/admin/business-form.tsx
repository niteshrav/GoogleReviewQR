"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@frontend/components/ui/alert";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";

type PlanOption = {
  key: string;
  label: string;
};

type BusinessFormProps = {
  initialValues?: {
    id?: string;
    name?: string;
    slug?: string;
    ownerEmail?: string;
    ownerWhatsApp?: string;
    ownerSmsPhone?: string;
    googleReviewUrl?: string;
    plan?: string;
    billingStatus?: "trial" | "invoiced" | "paid" | "overdue";
    setupFeePaid?: boolean;
  };
  planOptions?: PlanOption[];
  onSuccess?: () => void;
};

const fallbackPlanOptions: PlanOption[] = [
  { key: "pilot", label: "Pilot (free)" },
  { key: "core", label: "Core ₹499/mo" },
  { key: "premium", label: "Premium ₹999/mo" },
];

export function BusinessForm({ initialValues, planOptions, onSuccess }: BusinessFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);
  const plans = planOptions && planOptions.length > 0 ? planOptions : fallbackPlanOptions;

  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [ownerEmail, setOwnerEmail] = useState(initialValues?.ownerEmail ?? "");
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(initialValues?.ownerWhatsApp ?? "");
  const [ownerSmsPhone, setOwnerSmsPhone] = useState(initialValues?.ownerSmsPhone ?? "");
  const [googleReviewUrl, setGoogleReviewUrl] = useState(initialValues?.googleReviewUrl ?? "");
  const [plan, setPlan] = useState(initialValues?.plan ?? "pilot");
  const [billingStatus, setBillingStatus] = useState(initialValues?.billingStatus ?? "trial");
  const [setupFeePaid, setSetupFeePaid] = useState(initialValues?.setupFeePaid ?? false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug,
      ownerEmail,
      ownerWhatsApp,
      ownerSmsPhone,
      googleReviewUrl,
      plan,
      billingStatus,
      setupFeePaid,
    };

    const response = await fetch(
      isEdit ? `/api/admin/businesses/${initialValues?.id}` : "/api/admin/businesses",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not save business.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    router.refresh();
    if (!isEdit) {
      setName("");
      setSlug("");
      setOwnerEmail("");
      setOwnerWhatsApp("");
      setOwnerSmsPhone("");
      setGoogleReviewUrl("");
      setPlan(plans[0]?.key ?? "pilot");
      setBillingStatus("trial");
      setSetupFeePaid(false);
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
    >
      <Input
        id="name"
        label="Business name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Cafe Edelweiss"
      />

      <Input
        id="slug"
        label="Slug"
        required
        disabled={isEdit}
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        hint={isEdit ? "Slug cannot be changed after creation." : "Used in /r/[slug] URLs"}
        placeholder="cafe-edelweiss"
      />

      <Input
        id="ownerEmail"
        type="email"
        label="Owner email"
        required
        value={ownerEmail}
        onChange={(event) => setOwnerEmail(event.target.value)}
        placeholder="owner@business.com"
      />

      <Input
        id="ownerWhatsApp"
        label="Owner WhatsApp"
        value={ownerWhatsApp}
        onChange={(event) => setOwnerWhatsApp(event.target.value)}
        placeholder="+919876543210"
        hint="For automated WhatsApp alerts (E.164). Provide WhatsApp or SMS phone."
      />

      <Input
        id="ownerSmsPhone"
        label="Owner SMS phone"
        value={ownerSmsPhone}
        onChange={(event) => setOwnerSmsPhone(event.target.value)}
        placeholder="+919876543210"
        hint="SMS fallback if WhatsApp fails. At least one phone number is required."
      />

      <Input
        id="googleReviewUrl"
        label="Google review URL"
        required
        value={googleReviewUrl}
        onChange={(event) => setGoogleReviewUrl(event.target.value)}
        placeholder="https://g.page/r/..."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="plan" className="mb-2 block text-sm font-medium text-foreground">
            Plan
          </label>
          <select
            id="plan"
            value={plan}
            onChange={(event) => setPlan(event.target.value as typeof plan)}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)]"
          >
            {plans.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="billingStatus" className="mb-2 block text-sm font-medium text-foreground">
            Billing status
          </label>
          <select
            id="billingStatus"
            value={billingStatus}
            onChange={(event) => setBillingStatus(event.target.value as typeof billingStatus)}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="trial">Trial</option>
            <option value="invoiced">Invoiced (UPI)</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={setupFeePaid}
          onChange={(event) => setSetupFeePaid(event.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Setup fee ₹2,999 received
      </label>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" loading={loading} fullWidth>
        {loading ? "Saving..." : isEdit ? "Update business" : "Create business"}
      </Button>
    </form>
  );
}
