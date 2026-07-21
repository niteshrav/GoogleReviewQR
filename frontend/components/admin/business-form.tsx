"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type BusinessFormProps = {
  initialValues?: {
    id?: string;
    name?: string;
    slug?: string;
    ownerEmail?: string;
    ownerWhatsApp?: string;
    googleReviewUrl?: string;
  };
  onSuccess?: () => void;
};

export function BusinessForm({ initialValues, onSuccess }: BusinessFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialValues?.id);

  const [name, setName] = useState(initialValues?.name ?? "");
  const [slug, setSlug] = useState(initialValues?.slug ?? "");
  const [ownerEmail, setOwnerEmail] = useState(initialValues?.ownerEmail ?? "");
  const [ownerWhatsApp, setOwnerWhatsApp] = useState(initialValues?.ownerWhatsApp ?? "");
  const [googleReviewUrl, setGoogleReviewUrl] = useState(initialValues?.googleReviewUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug,
      ownerEmail,
      ownerWhatsApp,
      googleReviewUrl,
    };

    const response = await fetch(
      isEdit ? `/api/admin/businesses/${initialValues?.id}` : "/api/admin/businesses",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not save business.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    router.refresh();
    if (!isEdit) {
      setName("");
      setSlug("");
      setOwnerEmail("");
      setOwnerWhatsApp("");
      setGoogleReviewUrl("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Business name
        </label>
        <input
          id="name"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          Slug
        </label>
        <input
          id="slug"
          required
          disabled={isEdit}
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm disabled:bg-slate-100"
        />
      </div>

      <div>
        <label htmlFor="ownerEmail" className="block text-sm font-medium">
          Owner email
        </label>
        <input
          id="ownerEmail"
          type="email"
          required
          value={ownerEmail}
          onChange={(event) => setOwnerEmail(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="ownerWhatsApp" className="block text-sm font-medium">
          Owner WhatsApp (optional)
        </label>
        <input
          id="ownerWhatsApp"
          value={ownerWhatsApp}
          onChange={(event) => setOwnerWhatsApp(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
          placeholder="+919876543210"
        />
      </div>

      <div>
        <label htmlFor="googleReviewUrl" className="block text-sm font-medium">
          Google review URL
        </label>
        <input
          id="googleReviewUrl"
          required
          value={googleReviewUrl}
          onChange={(event) => setGoogleReviewUrl(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Saving..." : isEdit ? "Update business" : "Create business"}
      </button>
    </form>
  );
}
