"use client";

import { useRouter } from "next/navigation";

type AdminBusinessActionsProps = {
  businessId: string;
  slug: string;
};

export function AdminBusinessActions({ businessId }: AdminBusinessActionsProps) {
  const router = useRouter();

  async function handleDeactivate() {
    const confirmed = window.confirm("Deactivate this business? Its QR links will stop working.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/businesses/${businessId}/deactivate`, {
      method: "PATCH",
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleDeactivate}
      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
    >
      Deactivate
    </button>
  );
}
