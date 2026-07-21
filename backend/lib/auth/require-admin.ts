import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSecret } from "@backend/lib/auth/admin";

export async function isAdminRequestAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSecret(session);
}

export function isAdminAuthorizedFromHeader(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`));
  return verifyAdminSecret(match?.[1]);
}
