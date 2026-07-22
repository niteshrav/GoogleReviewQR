"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@frontend/components/ui/button";

type AdminBusinessActionsProps = {
  businessId: string;
  slug: string;
  isActive: boolean;
  businessName: string;
};

export function AdminBusinessActions({
  businessId,
  isActive,
  businessName,
}: AdminBusinessActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"deactivate" | "delete" | null>(null);

  async function handleDeactivate() {
    const confirmed = window.confirm(
      `Deactivate “${businessName}”? Its QR links will stop working (you can keep the record).`,
    );
    if (!confirmed) {
      return;
    }

    setLoading("deactivate");
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}/deactivate`, {
        method: "PATCH",
      });
      if (response.ok) {
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Permanently delete “${businessName}” and all its feedback?\n\nThis cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    const typed = window.prompt(`Type DELETE to confirm removing “${businessName}”:`);
    if (typed !== "DELETE") {
      return;
    }

    setLoading("delete");
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
      } else {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        window.alert(data?.error ?? "Could not delete business.");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
      {isActive ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          loading={loading === "deactivate"}
          onClick={handleDeactivate}
        >
          Deactivate
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="danger"
        loading={loading === "delete"}
        onClick={handleDelete}
      >
        Delete
      </Button>
    </div>
  );
}
