import Link from "next/link";
import { businessService } from "@backend/lib/services/index";
import { BusinessForm } from "@frontend/components/admin/business-form";
import { AdminBusinessCard } from "@frontend/components/admin/admin-business-card";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const businesses = await businessService.listBusinesses();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Businesses</h1>
        </div>
        <Link href="/admin" className="text-sm text-brand hover:underline">
          Back to admin
        </Link>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Create business</h2>
          <BusinessForm />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All businesses</h2>
          {businesses.length === 0 ? (
            <p className="text-sm text-muted">No businesses yet.</p>
          ) : (
            businesses.map((business) => (
              <AdminBusinessCard key={business.id} business={business} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
