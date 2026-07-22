"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@frontend/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="ghost" loading={loading} onClick={handleLogout}>
      Sign out
    </Button>
  );
}
