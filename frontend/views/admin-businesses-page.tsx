import Link from "next/link";
import { businessService } from "@backend/lib/services/index";
import { BusinessForm } from "@frontend/components/admin/business-form";
import { AdminBusinessCard } from "@frontend/components/admin/admin-business-card";
import { Card } from "@frontend/components/ui/card";
import { EmptyState } from "@frontend/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const businesses = await businessService.listBusinesses();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Businesses</h1>
          <p className="mt-2 text-sm text-muted">
            Create merchants, download QR codes, and open feedback logs.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-brand hover:underline">
          ← Back to dashboard
        </Link>
      </div>

      <section className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Create business</h2>
          <BusinessForm />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">All businesses</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-muted">
              {businesses.length}
            </span>
          </div>
          {businesses.length === 0 ? (
            <EmptyState
              title="No businesses yet"
              description="Create your first pilot business using the form. QR export and feedback logs appear here."
              icon={<span>▣</span>}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {businesses.map((business) => (
                <AdminBusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Card className="border-dashed bg-slate-50/70">
        <p className="text-sm text-muted">
          Tip: After creating a business, download the QR PNG and place it at the counter. The public
          page lives at <code className="rounded bg-white px-1.5 py-0.5 text-xs">/r/[slug]</code>.
        </p>
      </Card>
    </div>
  );
}
