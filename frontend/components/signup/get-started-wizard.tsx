"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";
import { Alert } from "@frontend/components/ui/alert";
import { Button } from "@frontend/components/ui/button";
import { Card } from "@frontend/components/ui/card";
import { Input } from "@frontend/components/ui/input";

type PlanInfo = {
  key: string;
  name: string;
  tagline: string | null;
  priceInr: number;
  setupFeeInr: number;
  features: string[];
  dueNowInr: number;
};

type PaymentMethod = "cash" | "card" | "upi";

const steps = ["Register", "Payment method", "Payment details", "Done"] as const;

export function GetStartedWizard({ initialPlanKey }: { initialPlanKey: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [upiVpa, setUpiVpa] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerWhatsApp, setOwnerWhatsApp] = useState("");
  const [ownerSmsPhone, setOwnerSmsPhone] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [password, setPassword] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [cashReceiptNote, setCashReceiptNote] = useState("");
  const [completedSlug, setCompletedSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingPlan(true);
      try {
        const response = await fetch(`/api/signup?plan=${encodeURIComponent(initialPlanKey)}`);
        const data = (await response.json()) as {
          plan?: PlanInfo;
          upiVpa?: string;
          error?: string;
        };
        if (!response.ok || !data.plan) {
          throw new Error(data.error ?? "Could not load plan");
        }
        if (!cancelled) {
          setPlan(data.plan);
          setUpiVpa(data.upiVpa ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load plan");
        }
      } finally {
        if (!cancelled) {
          setLoadingPlan(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [initialPlanKey]);

  const dueLabel = useMemo(() => {
    if (!plan) {
      return "";
    }
    return `₹${plan.dueNowInr} (setup ₹${plan.setupFeeInr} + monthly ₹${plan.priceInr})`;
  }, [plan]);

  function goNextFromRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim() || !ownerEmail.trim() || !googleReviewUrl.trim()) {
      setError("Fill all required registration fields.");
      return;
    }
    if (!ownerWhatsApp.trim() && !ownerSmsPhone.trim()) {
      setError("Provide WhatsApp or SMS phone.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setStep(1);
  }

  function selectMethod(method: PaymentMethod) {
    setPaymentMethod(method);
    setError(null);
    setStep(2);
  }

  async function submitPayment(event: FormEvent) {
    event.preventDefault();
    if (!plan || !paymentMethod) {
      return;
    }
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planKey: plan.key,
        name,
        slug,
        ownerEmail,
        ownerWhatsApp,
        ownerSmsPhone,
        googleReviewUrl,
        password,
        paymentMethod,
        paymentReference,
        cardHolderName,
        cardLast4,
        cashReceiptNote,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string; business?: { slug: string }; next?: string }
      | null;

    if (!response.ok) {
      setError(data?.error ?? "Payment could not be completed");
      setSubmitting(false);
      return;
    }

    setCompletedSlug(data?.business?.slug ?? slug);
    setStep(3);
    setSubmitting(false);
  }

  if (loadingPlan) {
    return (
      <Card className="mx-auto max-w-lg">
        <p className="text-sm text-muted">Loading plan…</p>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="mx-auto max-w-lg space-y-4">
        <Alert variant="error">{error ?? "Plan not available"}</Alert>
        <Link href="/#pricing" className="text-sm font-medium text-brand hover:underline">
          ← Back to pricing
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              index === step
                ? "bg-brand text-white"
                : index < step
                  ? "bg-brand-soft text-brand"
                  : "bg-slate-100 text-muted"
            }`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      <Card className="space-y-2">
        <p className="text-sm font-semibold text-brand">Selected plan</p>
        <h1 className="text-2xl font-semibold tracking-tight">{plan.name}</h1>
        {plan.tagline ? <p className="text-sm text-muted">{plan.tagline}</p> : null}
        <p className="text-sm font-medium text-foreground">Pay now: {dueLabel}</p>
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {step === 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">Registration</h2>
          <p className="mt-1 text-sm text-muted">Create your TrustTap business account.</p>
          <form onSubmit={goNextFromRegister} className="mt-5 space-y-4">
            <Input
              id="name"
              label="Business name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              id="slug"
              label="Slug"
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value.toLowerCase())}
              hint="Used in /r/your-slug"
              placeholder="my-cafe"
            />
            <Input
              id="email"
              type="email"
              label="Owner email"
              required
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
            />
            <Input
              id="whatsapp"
              label="WhatsApp"
              value={ownerWhatsApp}
              onChange={(event) => setOwnerWhatsApp(event.target.value)}
              placeholder="+9198…"
            />
            <Input
              id="sms"
              label="SMS phone"
              value={ownerSmsPhone}
              onChange={(event) => setOwnerSmsPhone(event.target.value)}
              placeholder="+9198…"
            />
            <Input
              id="google"
              label="Google review URL"
              required
              value={googleReviewUrl}
              onChange={(event) => setGoogleReviewUrl(event.target.value)}
            />
            <Input
              id="password"
              type="password"
              label="Dashboard password"
              required
              showPasswordToggle
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint="You will use this to sign in to the admin dashboard."
            />
            <Button type="submit" fullWidth size="lg">
              Continue to payment
            </Button>
          </form>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Choose payment option</h2>
          <p className="text-sm text-muted">Amount due: {dueLabel}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { id: "upi", title: "UPI", body: "Pay via UPI and share transaction ID" },
                { id: "card", title: "Card", body: "Card payment details (demo capture)" },
                { id: "cash", title: "Cash", body: "Record cash payment / receipt" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectMethod(option.id)}
                className="rounded-2xl border border-border bg-white p-4 text-left transition hover:border-brand hover:bg-brand-soft"
              >
                <p className="font-semibold">{option.title}</p>
                <p className="mt-1 text-sm text-muted">{option.body}</p>
              </button>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={() => setStep(0)}>
            Back
          </Button>
        </Card>
      ) : null}

      {step === 2 && paymentMethod ? (
        <Card>
          <h2 className="text-lg font-semibold">Payment details</h2>
          <p className="mt-1 text-sm text-muted">
            Method: <span className="font-medium text-foreground uppercase">{paymentMethod}</span> ·{" "}
            {dueLabel}
          </p>
          <form onSubmit={submitPayment} className="mt-5 space-y-4">
            {paymentMethod === "upi" ? (
              <>
                {upiVpa ? (
                  <p className="rounded-xl bg-brand-soft px-3 py-2 text-sm text-foreground">
                    Pay to UPI: <strong>{upiVpa}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-muted">
                    Complete UPI transfer to Commiters, then enter the reference below.
                  </p>
                )}
                <Input
                  id="upi-ref"
                  label="UPI transaction / reference ID"
                  required
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                />
              </>
            ) : null}

            {paymentMethod === "card" ? (
              <>
                <Input
                  id="card-name"
                  label="Cardholder name"
                  required
                  value={cardHolderName}
                  onChange={(event) => setCardHolderName(event.target.value)}
                />
                <Input
                  id="card-last4"
                  label="Last 4 digits"
                  required
                  maxLength={4}
                  value={cardLast4}
                  onChange={(event) =>
                    setCardLast4(event.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  hint="Demo capture only — no live card charge in Phase 2."
                />
              </>
            ) : null}

            {paymentMethod === "cash" ? (
              <Input
                id="cash-note"
                label="Cash receipt / note"
                required
                value={cashReceiptNote}
                onChange={(event) => setCashReceiptNote(event.target.value)}
                hint="Example: Paid at counter · receipt #12"
              />
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" loading={submitting} fullWidth className="sm:flex-1">
                {paymentMethod === "cash" ? "Record payment & open dashboard" : "Complete payment"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-success">Payment complete</h2>
          <p className="text-sm text-muted">
            Your {plan.name} account is ready
            {completedSlug ? (
              <>
                {" "}
                for <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/{completedSlug}</code>
              </>
            ) : null}
            . Dashboard access is credited to this browser session.
          </p>
          <ul className="space-y-1 text-sm text-muted">
            <li>• Business created and activated</li>
            <li>• Plan assigned: {plan.name}</li>
            <li>
              • Billing:{" "}
              {paymentMethod === "cash" ? "Invoiced (cash recorded)" : "Marked paid"}
            </li>
          </ul>
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={() => {
              router.push("/admin");
              router.refresh();
            }}
          >
            Open dashboard
          </Button>
          <p className="text-xs text-muted">
            Later login: use your dashboard password on{" "}
            <Link href="/admin/login" className="text-brand hover:underline">
              /admin/login
            </Link>
            .
          </p>
        </Card>
      ) : null}
    </div>
  );
}

export function GetStartedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-mesh min-h-[100dvh]">
      <header className="border-b border-border bg-white/90">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" aria-label="TrustTap home">
            <TrustTapLogo variant="horizontal" tagline />
          </Link>
          <Link href="/#pricing" className="text-sm font-medium text-muted hover:text-foreground">
            All plans
          </Link>
        </div>
      </header>
      <main className="px-5 py-10">{children}</main>
    </div>
  );
}
