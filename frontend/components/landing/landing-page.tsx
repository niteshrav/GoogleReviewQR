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
    icon: "▣",
  },
  {
    title: "Private feedback first",
    description: "Capture honest ratings and comments privately so you can improve faster.",
    icon: "◎",
  },
  {
    title: "Google reviews, ungated",
    description: "Every customer sees the same Google review option. No rating tricks.",
    icon: "★",
  },
  {
    title: "Owner alerts",
    description: "Low ratings can trigger email alerts so you can follow up quickly.",
    icon: "⚡",
  },
];

const steps = [
  { step: "01", title: "Create a business", body: "Add your Google review link and owner contacts in admin." },
  { step: "02", title: "Print the QR", body: "Download a high-quality PNG and place it at the counter." },
  { step: "03", title: "Collect & improve", body: "Review private feedback and grow your public reputation." },
];

const testimonials = [
  {
    quote: "We finally get honest private notes without making Google reviews feel awkward.",
    name: "Priya N.",
    role: "Cafe owner",
  },
  {
    quote: "Setup took minutes. The QR page looks premium on every phone we tested.",
    name: "Rahul M.",
    role: "Restaurant manager",
  },
  {
    quote: "Alerts on low ratings help us fix issues before they become public reviews.",
    name: "Ananya S.",
    role: "Boutique hotel",
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

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-foreground sm:text-base">{question}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <p className="pb-5 pr-12 text-sm leading-relaxed text-muted">{answer}</p> : null}
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="bg-mesh min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/70 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white shadow-sm">
              F
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              FeedbackFlow
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-slate-100 hover:text-foreground sm:inline-flex"
            >
              Admin
            </Link>
            <Link href="/admin/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <FadeIn immediate>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Commiters FeedbackFlow
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Collect better feedback.
              <span className="block text-brand">Grow Google reviews.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              QR-powered customer feedback for local businesses — private notes for you, an
              ungated Google review path for everyone.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admin/login">
                <Button size="lg">Open admin dashboard</Button>
              </Link>
              <a href="#how">
                <Button size="lg" variant="outline">
                  See how it works
                </Button>
              </a>
            </div>
            <p className="mt-6 text-xs text-muted">
              Compliant by design — we never gate Google reviews by rating.
            </p>
          </FadeIn>

          <FadeIn immediate delay={0.12} className="relative">
            <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-brand/10 via-transparent to-secondary/10 blur-2xl" />
            <Card className="relative overflow-hidden p-0" padding="none">
              <div className="border-b border-border bg-slate-50/80 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
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
                  <p className="mt-2 text-sm text-muted">
                    One scan opens a polished mobile page with private feedback and Google review.
                  </p>
                  <div className="mt-5 space-y-2">
                    <div className="rounded-xl bg-brand px-4 py-3 text-center text-sm font-semibold text-white">
                      Leave a Google Review
                    </div>
                    <div className="rounded-xl border border-border px-4 py-3 text-center text-sm font-medium">
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
                            : "bg-slate-200"
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

        <section id="features" className="border-t border-border bg-white/60 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <p className="text-sm font-semibold text-brand">Features</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built for real counters</h2>
              <p className="mt-3 max-w-2xl text-muted">
                Everything you need for Phase 1 pilots — without clutter or review-gating dark patterns.
              </p>
            </FadeIn>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <FadeIn key={feature.title} delay={index * 0.06}>
                  <Card hover className="h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      {feature.icon}
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
              {[
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
              ].map((item, index) => (
                <FadeIn key={item.title} delay={index * 0.08}>
                  <Card className="h-full border-l-4 border-l-brand">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-border bg-white/60 py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <p className="text-sm font-semibold text-brand">How it works</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps to go live</h2>
            </FadeIn>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {steps.map((item, index) => (
                <FadeIn key={item.step} delay={index * 0.08}>
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

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FadeIn>
              <p className="text-sm font-semibold text-brand">Testimonials</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Trusted by local teams</h2>
            </FadeIn>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {testimonials.map((item, index) => (
                <FadeIn key={item.name} delay={index * 0.08}>
                  <Card className="h-full">
                    <p className="text-sm leading-relaxed text-foreground">&ldquo;{item.quote}&rdquo;</p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted">{item.role}</p>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-border bg-white/60 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
            <FadeIn>
              <p className="text-sm font-semibold text-brand">FAQ</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Questions, answered</h2>
              <p className="mt-3 text-muted">
                Still unsure? Open admin and try the seeded pilot businesses locally.
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <Card padding="md">
                {faqs.map((item) => (
                  <FaqItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </Card>
            </FadeIn>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8">
          <FadeIn>
            <Card className="mx-auto max-w-6xl overflow-hidden bg-gradient-to-br from-brand to-brand-dark p-8 text-white sm:p-12">
              <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">Ready to launch your pilot?</h2>
                  <p className="mt-3 max-w-xl text-blue-100">
                    Sign in to the admin panel, create a business, download your QR, and start collecting feedback today.
                  </p>
                </div>
                <Link href="/admin/login">
                  <Button
                    size="lg"
                    className="bg-white text-brand hover:bg-blue-50 hover:text-brand-dark"
                  >
                    Launch admin
                  </Button>
                </Link>
              </div>
            </Card>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white">
                F
              </span>
              <span className="font-semibold">FeedbackFlow</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted">
              QR-powered customer feedback by Commiters. Phase 1 MVP for local businesses.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-foreground">Product</p>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  <a href="#features" className="hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:text-foreground">
                    How it works
                  </a>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-foreground">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">Resources</p>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  <Link href="/api/health" className="hover:text-foreground">
                    Health check
                  </Link>
                </li>
                <li>
                  <a href="https://commiters.in" className="hover:text-foreground">
                    Commiters
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">Compliance</p>
              <p className="mt-3 text-muted">No review gating. Same Google CTA for every customer.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p>© {new Date().getFullYear()} Commiters FeedbackFlow</p>
            <p>
              Powered by{" "}
              <a href="https://commiters.in" className="font-medium text-brand hover:underline">
                Commiters
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
