"use client";

import { useEffect } from "react";
import { Button } from "@frontend/components/ui/button";
import { Card } from "@frontend/components/ui/card";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[admin] page error", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-10">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Could not load this page</h1>
        <p className="mt-3 text-sm text-muted">
          A server error occurred while loading admin. This is often a database query failing after
          deploy. Try again; if it keeps failing, production may need{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">npm run db:migrate:deploy</code>.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-muted">Error digest: {error.digest}</p>
        ) : null}
        <div className="mt-6">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      </Card>
    </div>
  );
}
