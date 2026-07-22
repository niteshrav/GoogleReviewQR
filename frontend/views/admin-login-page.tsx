import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSecret } from "@backend/lib/auth/admin";
import {
  getSeededLoginCredentials,
  isSeededLoginAllowed,
} from "@backend/lib/fixtures/seeded-login-credentials";
import { AdminLoginForm } from "@frontend/components/admin/admin-login-form";
import { SeededLoginHints } from "@frontend/components/admin/seeded-login-hints";
import { Card } from "@frontend/components/ui/card";

type AdminLoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { next } = await searchParams;
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (verifyAdminSecret(session)) {
    redirect(next && next.startsWith("/admin") ? next : "/admin");
  }

  const showSeededHints = isSeededLoginAllowed();
  const seededCredentials = showSeededHints ? getSeededLoginCredentials() : [];

  return (
    <main className="bg-mesh flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-md shadow-blue-200">
            F
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-brand">
            Admin login
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            Enter the admin secret configured in your environment
            {showSeededHints ? ", or use a seeded example credential below" : ""}.
          </p>
        </div>

        <Card>
          <AdminLoginForm nextPath={next} />
        </Card>

        <SeededLoginHints credentials={seededCredentials} />
      </div>
    </main>
  );
}
