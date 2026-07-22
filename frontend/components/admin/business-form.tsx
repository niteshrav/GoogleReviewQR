"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@frontend/components/ui/alert";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";

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
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
    >
      <Input
        id="name"
        label="Business name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Cafe Edelweiss"
      />

      <Input
        id="slug"
        label="Slug"
        required
        disabled={isEdit}
        value={slug}
        onChange={(event) => setSlug(event.target.value)}
        hint={isEdit ? "Slug cannot be changed after creation." : "Used in /r/[slug] URLs"}
        placeholder="cafe-edelweiss"
      />

      <Input
        id="ownerEmail"
        type="email"
        label="Owner email"
        required
        value={ownerEmail}
        onChange={(event) => setOwnerEmail(event.target.value)}
        placeholder="owner@business.com"
      />

      <Input
        id="ownerWhatsApp"
        label="Owner WhatsApp (optional)"
        value={ownerWhatsApp}
        onChange={(event) => setOwnerWhatsApp(event.target.value)}
        placeholder="+919876543210"
      />

      <Input
        id="googleReviewUrl"
        label="Google review URL"
        required
        value={googleReviewUrl}
        onChange={(event) => setGoogleReviewUrl(event.target.value)}
        placeholder="https://g.page/r/..."
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" loading={loading} fullWidth>
        {loading ? "Saving..." : isEdit ? "Update business" : "Create business"}
      </Button>
    </form>
  );
}
