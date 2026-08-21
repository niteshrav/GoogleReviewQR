import { ADMIN_SESSION_COOKIE, verifyAdminSecret } from "@backend/lib/auth/admin";

export async function isAdminAuthorized(session: string | undefined): Promise<boolean> {
  return verifyAdminSecret(session);
}

export async function isAdminAuthorizedFromHeader(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`));
  return verifyAdminSecret(match?.[1] ? decodeURIComponent(match[1]) : undefined);
}
