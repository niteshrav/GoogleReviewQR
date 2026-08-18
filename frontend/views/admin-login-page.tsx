import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSecret } from "@backend/lib/auth/admin";
import {
  getSeededLoginCredentials,
  isSeededLoginAllowed,
} from "@backend/lib/fixtures/seeded-login-credentials";
import { AdminLoginForm } from "@frontend/components/admin/admin-login-form";
import { SeededLoginHints } from "@frontend/components/admin/seeded-login-hints";
import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";
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
    <main className="bg-quiet flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <TrustTapLogo variant="horizontal" tagline />
          <h1 className="mt-8 text-xl font-semibold tracking-tight">Admin login</h1>
          <p className="mt-2 text-sm text-muted">
            Enter the admin secret from your environment
            {showSeededHints ? ", or use a seeded credential below" : ""}.
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
