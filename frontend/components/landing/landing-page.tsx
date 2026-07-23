"use client";

import Link from "next/link";
import { useState } from "react";
import { FadeIn } from "@frontend/components/motion/fade-in";
import { Button } from "@frontend/components/ui/button";
import { Card } from "@frontend/components/ui/card";

const features = [
  {
    title: "QR-powered collection",
    description: "Print one QR code. Customers land on a clean mobile page in seconds.",
  },
  {
    title: "Private feedback first",
    description: "Capture honest ratings and comments privately so you can improve faster.",
  },
  {
    title: "Google reviews, ungated",
    description: "Every customer sees the same Google review option. No rating tricks.",
  },
  {
    title: "Owner alerts",
    description: "Low ratings can trigger email alerts so you can follow up quickly.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a business",
    body: "Add your Google review link and owner contacts in admin.",
  },
  {
    step: "02",
    title: "Print the QR",
    body: "Download a high-quality PNG and place it at the counter.",
  },
  {
    step: "03",
    title: "Collect & improve",
    body: "Review private feedback and grow your public reputation.",
  },
];

const benefits = [
  {
    title: "Protect reputation",
    body: "Private feedback catches issues early while Google stays open to everyone.",
  },
  {
    title: "Look professional",
    body: "Customers land on a trustworthy, branded mobile experience — not a form dump.",
  },
  {
    title: "Operate simply",
    body: "Admin tools for businesses, QR export, and feedback logs — no extra apps.",
  },
];

const faqs = [
  {
    q: "Does FeedbackFlow gate Google reviews by rating?",
    a: "No. Every customer always sees the same Google review option. Private feedback is separate.",
  },
  {
    q: "Do customers need to create an account?",
    a: "No. The customer flow is anonymous and mobile-first — scan, rate, done.",
  },
  {
    q: "Can I download QR codes?",
    a: "Yes. Each business card in admin includes a one-click PNG download for print.",
  },
  {
    q: "Who is this for?",
    a: "Local businesses that want cleaner feedback loops and easier Google review collection.",
  },
];

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border transition-colors ${
        open ? "border-brand/25 bg-white shadow-[var(--shadow-sm)]" : "border-border bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground sm:text-base">{question}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            open ? "bg-brand text-white" : "bg-brand-soft text-brand"
          }`}
          aria-hidden
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div className="border-t border-border px-5 pb-5 pt-4 sm:px-6">
          <p className="max-w-3xl text-sm leading-relaxed text-muted sm:text-[15px]">{answer}</p>
        </div>
      ) : null}
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <FadeIn>
          <div className="text-center">
            <p className="text-sm font-semibold text-brand">FAQ</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Quick answers about compliance, customer flow, and QR setup.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.06}>
          <div className="mt-10 space-y-3">
            {faqs.map((item, index) => (
              <FaqItem
                key={item.q}
                question={item.q}
                answer={item.a}
                open={openIndex === index}
                onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="bg-mesh min-h-[100dvh]">
      <header className="sticky top-0 z-40 glass pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-sm">
              F
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              FeedbackFlow
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border md:hidden"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? "✕" : "☰"}
            </button>
            <Link
              href="/admin"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-soft hover:text-foreground sm:inline-flex"
            >
              Admin
            </Link>
            <Link href="/admin/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
        {mobileNavOpen ? (
          <nav className="border-t border-border bg-white/95 px-4 py-3 md:hidden">
            <ul className="space-y-1">
              {[
                { href: "#features", label: "Features" },
                { href: "#how", label: "How it works" },
                { href: "#faq", label: "FAQ" },
                { href: "/admin/login", label: "Admin login" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex min-h-[44px] items-center rounded-xl px-3 text-base font-medium text-foreground hover:bg-brand-soft"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <FadeIn immediate>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Commiters FeedbackFlow
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Collect better feedback.
              <span className="mt-1 block text-brand">Grow Google reviews.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              QR-powered customer feedback for local businesses — private notes for you, an
              ungated Google review path for everyone.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/admin/login" className="w-full sm:w-auto">
                <Button size="lg" fullWidth className="sm:w-auto">
                  Open admin dashboard
                </Button>
              </Link>
              <a href="#how" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" fullWidth className="sm:w-auto">
                  See how it works
                </Button>
              </a>
            </div>
            <p className="mt-6 text-xs text-muted">
              Compliant by design — we never gate Google reviews by rating.
            </p>
          </FadeIn>

          <FadeIn immediate delay={0.1} className="relative">
            <div
              className="absolute -inset-6 rounded-[32px] opacity-70 blur-2xl"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(15,76,70,0.16), transparent 55%), radial-gradient(circle at 80% 80%, rgba(61,107,102,0.12), transparent 50%)",
              }}
            />
            <Card className="relative overflow-hidden p-0 shadow-[var(--shadow-lg)]" padding="none">
              <div className="border-b border-border bg-brand-soft/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d4a5a5]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d4c4a5]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#a5c4b5]" />
                  <span className="ml-3 text-xs font-medium text-muted">/r/cafe-edelweiss</span>
                </div>
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">
                    Live preview
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">
                    How was your experience?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    One scan opens a polished mobile page with private feedback and Google review.
                  </p>
                  <div className="mt-5 space-y-2">
                    <div className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
                      Leave a Google Review
                    </div>
                    <div className="rounded-xl border border-border bg-white px-4 py-3 text-center text-sm font-medium">
                      Send private feedback
                    </div>
                  </div>
                </div>
                <div className="mx-auto flex h-44 w-44 flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <div
                    className="grid h-28 w-28 grid-cols-5 gap-1"
                    aria-hidden
                    role="img"
                    aria-label="QR code preview"
                  >
                    {Array.from({ length: 25 }).map((_, i) => (
                      <span
                        key={i}
                        className={`rounded-[2px] ${
                          [0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 19, 20, 22, 23, 24].includes(i)
                            ? "bg-foreground"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-muted">
                    Scan to open
                  </p>
                </div>
              </div>
            </Card>
          </FadeIn>
        </section>

        <section id="features" className="border-t border-border bg-white py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <p className="text-sm font-semibold text-brand">Features</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built for real counters</h2>
              <p className="mt-3 max-w-2xl text-muted">
                Everything you need for Phase 1 pilots — without clutter or review-gating dark
                patterns.
              </p>
            </FadeIn>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FadeIn key={feature.title} delay={index * 0.05}>
                  <Card hover className="h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-sm font-bold text-brand">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <p className="text-sm font-semibold text-brand">Benefits</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Why businesses choose it</h2>
            </FadeIn>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {benefits.map((item, index) => (
                <FadeIn key={item.title} delay={index * 0.06}>
                  <Card className="h-full border-l-4 border-l-brand">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-border bg-white py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <p className="text-sm font-semibold text-brand">How it works</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps to go live</h2>
            </FadeIn>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((item, index) => (
                <FadeIn key={item.step} delay={index * 0.06}>
                  <Card className="h-full">
                    <p className="text-xs font-bold tracking-widest text-brand">{item.step}</p>
                    <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted">{item.body}</p>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <FaqSection />

        <section className="px-5 py-20 sm:px-8">
          <FadeIn>
            <div
              className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-2xl px-8 py-10 sm:px-12 sm:py-12 lg:flex-row lg:items-center"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Ready to launch your pilot?
                </h2>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85">
                  Sign in to the admin panel, create a business, download your QR, and start
                  collecting feedback today.
                </p>
              </div>
              <Link
                href="/admin/login"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl px-5 py-3 text-base font-semibold transition-colors focus-ring"
                style={{ background: "#ffffff", color: "var(--brand)" }}
              >
                Launch admin
              </Link>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-10 sm:px-8 sm:py-12">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
            F
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-foreground">
              FeedbackFlow
            </p>
            <p className="mt-0.5 text-sm text-muted">Turn every visit into better service.</p>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} Commiters FeedbackFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
