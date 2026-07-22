"use client";

import { useRouter } from "next/navigation";
import { Button } from "@frontend/components/ui/button";

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
    <Button type="button" size="sm" variant="danger" onClick={handleDeactivate}>
      Deactivate
    </Button>
  );
}
