import Link from "next/link";
import { getPublicBaseUrl } from "@backend/lib/env";
import { businessService } from "@backend/lib/services/index";
import { AdminBusinessesClient } from "@frontend/components/admin/admin-businesses-client";
import { Card } from "@frontend/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminBusinessesPage() {
  const publicBaseUrl = getPublicBaseUrl();
  let businesses: Awaited<ReturnType<typeof businessService.listBusinesses>> = [];
  let loadError: string | null = null;

  try {
    businesses = await businessService.listBusinesses();
  } catch (error) {
    console.error("[admin/businesses] failed to list businesses", error);
    loadError = "Could not load businesses from the database.";
  }

  return (
    <div className="space-y-8">
      {loadError ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">{loadError}</p>
          <p className="mt-1 text-xs text-amber-800">
            After a deploy this usually means production is missing a Prisma migration.
          </p>
        </Card>
      ) : null}

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

      {publicBaseUrl.includes("localhost") ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            <strong>Phone QR tip:</strong> <code className="rounded bg-white px-1">BASE_URL</code> is
            still <code className="rounded bg-white px-1">localhost</code>. Phone scans will fail. Set{" "}
            <code className="rounded bg-white px-1">BASE_URL</code> to your PC Wi‑Fi IP (e.g.{" "}
            <code className="rounded bg-white px-1">http://192.168.x.x:3000</code>), restart{" "}
            <code className="rounded bg-white px-1">npm run dev</code>, then re-download QR.
          </p>
        </Card>
      ) : (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-900">
            QR codes &amp; share links use{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">{publicBaseUrl}</code>. Phone
            must be on the <strong>same Wi‑Fi</strong> as this PC.
          </p>
        </Card>
      )}

      <AdminBusinessesClient
        publicBaseUrl={publicBaseUrl}
        businesses={businesses.map((business) => ({
          id: business.id,
          name: business.name,
          slug: business.slug,
          ownerEmail: business.ownerEmail,
          ownerWhatsApp: business.ownerWhatsApp,
          ownerSmsPhone: business.ownerSmsPhone,
          googleReviewUrl: business.googleReviewUrl,
          isActive: business.isActive,
        }))}
      />

      <Card className="border-dashed bg-slate-50/70">
        <p className="text-sm text-muted">
          Tip: After creating a business, download the QR PNG again (old QRs still point to the old
          URL). Public page:{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">/r/[slug]</code>.
        </p>
      </Card>
    </div>
  );
}
