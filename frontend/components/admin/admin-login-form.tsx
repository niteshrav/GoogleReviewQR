"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@frontend/components/ui/alert";
import { Button } from "@frontend/components/ui/button";
import { Input } from "@frontend/components/ui/input";

type AdminLoginFormProps = {
  nextPath?: string;
};

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, next: nextPath }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Login failed");
      setLoading(false);
      return;
    }

    const data = (await response.json()) as { next?: string };
    router.push(data.next ?? "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="secret"
        name="secret"
        type="password"
        label="Admin secret"
        autoComplete="current-password"
        required
        value={secret}
        onChange={(event) => setSecret(event.target.value)}
        showPasswordToggle
        placeholder="Enter your admin secret"
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <Button type="submit" loading={loading} fullWidth size="lg">
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
