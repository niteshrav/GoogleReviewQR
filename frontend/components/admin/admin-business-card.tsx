"use client";

import { useState } from "react";
import Link from "next/link";
import { BusinessForm } from "@frontend/components/admin/business-form";
import { AdminBusinessActions } from "@frontend/components/admin/admin-business-actions";

type AdminBusinessCardProps = {
  business: {
    id: string;
    name: string;
    slug: string;
    ownerEmail: string;
    ownerWhatsApp: string | null;
    googleReviewUrl: string;
    isActive: boolean;
  };
};

export function AdminBusinessCard({ business }: AdminBusinessCardProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit {business.name}</h2>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-muted hover:underline"
          >
            Cancel
          </button>
        </div>
        <BusinessForm
          initialValues={{
            id: business.id,
            name: business.name,
            slug: business.slug,
            ownerEmail: business.ownerEmail,
            ownerWhatsApp: business.ownerWhatsApp ?? "",
            googleReviewUrl: business.googleReviewUrl,
          }}
          onSuccess={() => setEditing(false)}
        />
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{business.name}</h2>
          <p className="mt-1 text-sm text-muted">/{business.slug}</p>
          <p className="mt-2 text-sm">{business.ownerEmail}</p>
          <p className="mt-1 text-xs text-muted">
            Status: {business.isActive ? "Active" : "Inactive"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
          >
            Edit
          </button>
          {business.isActive ? (
            <AdminBusinessActions businessId={business.id} slug={business.slug} />
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href={`/r/${business.slug}`} className="text-brand hover:underline">
          View page
        </Link>
        <Link
          href={`/admin/businesses/${business.id}/feedback`}
          className="text-brand hover:underline"
        >
          Feedback log
        </Link>
        <a href={`/api/admin/qr/${business.slug}`} className="text-brand hover:underline">
          Download QR
        </a>
      </div>
    </article>
  );
}
