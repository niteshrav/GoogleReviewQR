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

type PaymentMethod = "cash" | "razorpay";

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

const steps = ["Register", "Payment method", "Pay", "Done"] as const;

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }
  if (window.Razorpay) {
    return true;
  }

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      if (window.Razorpay) {
        resolve(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function GetStartedWizard({ initialPlanKey }: { initialPlanKey: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [upiVpa, setUpiVpa] = useState("");
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
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
  const [cashReceiptNote, setCashReceiptNote] = useState("");
  const [completedSlug, setCompletedSlug] = useState<string | null>(null);
  const [paidReference, setPaidReference] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingPlan(true);
      try {
        const response = await fetch(`/api/signup?plan=${encodeURIComponent(initialPlanKey)}`);
        const data = (await response.json()) as {
          plan?: PlanInfo;
          upiVpa?: string;
          razorpayEnabled?: boolean;
          error?: string;
        };
        if (!response.ok || !data.plan) {
          throw new Error(data.error ?? "Could not load plan");
        }
        if (!cancelled) {
          setPlan(data.plan);
          setUpiVpa(data.upiVpa ?? "");
          setRazorpayEnabled(Boolean(data.razorpayEnabled));
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

  const registrationPayload = useMemo(
    () => ({
      planKey: plan?.key ?? initialPlanKey,
      name,
      slug,
      ownerEmail,
      ownerWhatsApp,
      ownerSmsPhone,
      googleReviewUrl: /^https?:\/\//i.test(googleReviewUrl.trim())
        ? googleReviewUrl.trim()
        : `https://${googleReviewUrl.trim()}`,
      password,
    }),
    [
      plan?.key,
      initialPlanKey,
      name,
      slug,
      ownerEmail,
      ownerWhatsApp,
      ownerSmsPhone,
      googleReviewUrl,
      password,
    ],
  );

  function isLikelyGoogleReviewUrl(raw: string): boolean {
    const value = raw.trim();
    if (!value) {
      return false;
    }
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const parsed = new URL(withProtocol);
      if (parsed.protocol !== "https:") {
        return false;
      }
      const host = parsed.hostname.replace(/^www\./, "");
      return (
        host === "search.google.com" ||
        host === "maps.google.com" ||
        host === "google.com" ||
        host === "g.page" ||
        host === "maps.app.goo.gl" ||
        host === "goo.gl"
      );
    } catch {
      return false;
    }
  }

  function goNextFromRegister(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim() || !ownerEmail.trim() || !googleReviewUrl.trim()) {
      setError("Fill all required registration fields.");
      return;
    }
    if (!isLikelyGoogleReviewUrl(googleReviewUrl)) {
      setError(
        "Enter a full Google review / Maps link (example: https://search.google.com/local/writereview?placeid=... or https://maps.app.goo.gl/...).",
      );
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
    if (method === "razorpay" && !razorpayEnabled) {
      setError(
        "Online payment is not configured yet. Add Razorpay keys to .env, or choose cash / offline.",
      );
      return;
    }
    setPaymentMethod(method);
    setError(null);
    setStep(2);
  }

  async function finalizeSignup(payload: Record<string, unknown>) {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          error?: string;
          business?: { slug: string };
          payment?: { reference?: string; status?: string };
        }
      | null;

    if (!response.ok) {
      throw new Error(data?.error ?? "Signup could not be completed");
    }

    setCompletedSlug(data?.business?.slug ?? slug);
    setPaidReference(data?.payment?.reference ?? null);
    setStep(3);
  }

  async function submitCashPayment(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await finalizeSignup({
        ...registrationPayload,
        paymentMethod: "cash",
        cashReceiptNote,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record cash payment");
    } finally {
      setSubmitting(false);
    }
  }

  async function startRazorpayPayment() {
    if (!plan) {
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout. Check your network and try again.");
      }

      const orderResponse = await fetch("/api/signup/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationPayload),
      });

      const orderData = (await orderResponse.json().catch(() => null)) as
        | {
            error?: string;
            orderId?: string;
            amountPaise?: number;
            currency?: string;
            keyId?: string;
            description?: string;
            prefill?: { name?: string; email?: string; contact?: string };
          }
        | null;

      if (!orderResponse.ok || !orderData?.orderId || !orderData.keyId || !orderData.amountPaise) {
        throw new Error(orderData?.error ?? "Could not create payment order");
      }

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amountPaise,
        currency: orderData.currency ?? "INR",
        name: "trustTap",
        description: orderData.description ?? `trustTap ${plan.name}`,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        notes: {
          planKey: plan.key,
          slug,
        },
        theme: { color: "#1e88e5" },
        handler: (response) => {
          void (async () => {
            try {
              await finalizeSignup({
                ...registrationPayload,
                paymentMethod: "razorpay",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Payment received but account setup failed. Contact support with your payment ID.",
              );
            } finally {
              setSubmitting(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError("Payment was cancelled. You can try again when ready.");
          },
        },
      });

      rzp.open();
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Could not start payment");
    }
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
          <p className="mt-1 text-sm text-muted">Create your trustTap business account.</p>
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
              placeholder="https://search.google.com/local/writereview?placeid=..."
              hint="Paste your Google Maps review link (writereview, maps.app.goo.gl, or google.com/maps)."
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
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => selectMethod("razorpay")}
              className={`rounded-2xl border p-4 text-left transition ${
                razorpayEnabled
                  ? "border-border bg-white hover:border-brand hover:bg-brand-soft"
                  : "cursor-not-allowed border-dashed border-border bg-slate-50 opacity-70"
              }`}
            >
              <p className="font-semibold">Pay online</p>
              <p className="mt-1 text-sm text-muted">
                UPI, debit/credit card, netbanking via Razorpay — OTP / UPI PIN as required by your bank.
              </p>
              {!razorpayEnabled ? (
                <p className="mt-2 text-xs font-medium text-amber-700">Gateway keys not configured</p>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => selectMethod("cash")}
              className="rounded-2xl border border-border bg-white p-4 text-left transition hover:border-brand hover:bg-brand-soft"
            >
              <p className="font-semibold">Cash / offline</p>
              <p className="mt-1 text-sm text-muted">
                Record cash or bank transfer receipt. Account stays invoiced until admin marks paid.
              </p>
            </button>
          </div>
          <Button type="button" variant="outline" onClick={() => setStep(0)}>
            Back
          </Button>
        </Card>
      ) : null}

      {step === 2 && paymentMethod === "razorpay" ? (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">Secure online payment</h2>
          <p className="text-sm text-muted">
            You will pay <strong className="text-foreground">{dueLabel}</strong> through Razorpay Checkout.
            Complete UPI PIN / card OTP in the payment window — amount is charged only after bank
            confirmation.
          </p>
          <ul className="space-y-1 text-sm text-muted">
            <li>• Supports UPI apps, cards, and netbanking</li>
            <li>• Card OTP / UPI PIN handled by your bank</li>
            <li>• Account is created only after payment verification</li>
          </ul>
          {upiVpa ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted">
              Manual UPI fallback for invoices: <strong className="text-foreground">{upiVpa}</strong>
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={submitting}>
              Back
            </Button>
            <Button
              type="button"
              loading={submitting}
              fullWidth
              className="sm:flex-1"
              onClick={() => void startRazorpayPayment()}
            >
              {submitting ? "Opening payment…" : `Pay ₹${plan.dueNowInr} now`}
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 2 && paymentMethod === "cash" ? (
        <Card>
          <h2 className="text-lg font-semibold">Cash / offline details</h2>
          <p className="mt-1 text-sm text-muted">
            Method: <span className="font-medium text-foreground">CASH</span> · {dueLabel}
          </p>
          <form onSubmit={submitCashPayment} className="mt-5 space-y-4">
            <Input
              id="cash-note"
              label="Cash receipt / note"
              required
              value={cashReceiptNote}
              onChange={(event) => setCashReceiptNote(event.target.value)}
              hint="Example: Paid at counter · receipt #12"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" loading={submitting} fullWidth className="sm:flex-1">
                Record payment & open dashboard
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-success">
            {paymentMethod === "razorpay" ? "Payment verified" : "Signup recorded"}
          </h2>
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
              {paymentMethod === "cash"
                ? "Invoiced (cash recorded — admin will confirm)"
                : "Paid (Razorpay verified)"}
            </li>
            {paidReference ? <li>• Reference: {paidReference}</li> : null}
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
          <Link href="/" aria-label="trustTap home">
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
