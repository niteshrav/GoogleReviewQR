import Link from "next/link";

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">FeedbackFlow control panel</h1>
          <p className="mt-2 text-sm text-muted">
            Manage pilot businesses, review feedback, and export QR codes.
          </p>
        </div>
        <Link href="/" className="text-sm text-brand hover:underline">
          Public site
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/businesses"
          className="rounded-2xl border border-border bg-card p-5 hover:bg-slate-50"
        >
          <h2 className="font-medium">Businesses</h2>
          <p className="mt-2 text-sm text-muted">Create and manage pilot merchants.</p>
        </Link>
        <article className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-medium">Feedback log</h2>
          <p className="mt-2 text-sm text-muted">Open a business card to review submissions.</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-medium">QR export</h2>
          <p className="mt-2 text-sm text-muted">Download PNG QR codes from each business card.</p>
        </article>
      </section>
    </main>
  );
}
