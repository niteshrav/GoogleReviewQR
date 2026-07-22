import type { SeededLoginCredential } from "@backend/lib/fixtures/seeded-login-credentials";

type SeededLoginHintsProps = {
  credentials: SeededLoginCredential[];
};

export function SeededLoginHints({ credentials }: SeededLoginHintsProps) {
  if (credentials.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Seeded example login credentials"
      className="mt-6 rounded-2xl border border-dashed border-border bg-white/80 p-4 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-foreground">Seeded example logins</h2>
      <p className="mt-1 text-xs text-muted">
        Use any secret below to sign in during local/dev testing. Hidden in production.
      </p>
      <ul className="mt-4 space-y-3">
        {credentials.map((credential) => (
          <li key={credential.slug} className="rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-sm">
            <p className="font-medium">{credential.name}</p>
            <p className="mt-1 font-mono text-xs text-brand">{credential.secret}</p>
            <p className="mt-1 text-xs text-muted">Customer page: {credential.reviewPath}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
