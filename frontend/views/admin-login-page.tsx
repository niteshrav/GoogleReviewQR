import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSecret } from "@backend/lib/auth/admin";
import {
  getSeededLoginCredentials,
  isSeededLoginAllowed,
} from "@backend/lib/fixtures/seeded-login-credentials";
import { AdminLoginForm } from "@frontend/components/admin/admin-login-form";
import { SeededLoginHints } from "@frontend/components/admin/seeded-login-hints";

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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-brand">Admin login</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">FeedbackFlow</h1>
      <p className="mt-2 text-sm text-muted">
        Enter the admin secret configured in your environment
        {showSeededHints ? ", or use a seeded example credential below" : ""}.
      </p>
      <AdminLoginForm nextPath={next} />
      <SeededLoginHints credentials={seededCredentials} />
    </main>
  );
}
