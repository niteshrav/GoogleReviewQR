import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">Commiters FeedbackFlow</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
        Customer feedback and Google reviews, without review gating.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Phase 1 scaffold is ready. Customer pages live at <code>/r/[slug]</code>. Admin tools live at{" "}
        <code>/admin</code>.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          Open admin
        </Link>
        <Link
          href="/api/health"
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-50"
        >
          Health check
        </Link>
      </div>
      <footer className="mt-16 text-sm text-muted">
        Powered by{" "}
        <a href="https://commiters.in" className="font-medium text-brand hover:underline">
          Commiters
        </a>
      </footer>
    </main>
  );
}
