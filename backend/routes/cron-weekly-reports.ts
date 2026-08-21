import { getEnv } from "@backend/lib/env";
import { jsonError, jsonOk } from "@backend/lib/http";
import { sendWeeklyReports } from "@backend/lib/reports/send-weekly-reports";

function isCronAuthorized(request: Request): boolean {
  const env = getEnv();
  const secret = env.CRON_SECRET || env.ADMIN_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const querySecret = new URL(request.url).searchParams.get("secret") ?? "";
  return bearer === secret || querySecret === secret;
}

export async function runWeeklyReports(request: Request) {
  if (!isCronAuthorized(request)) {
    return jsonError("Unauthorized", 401);
  }

  const result = await sendWeeklyReports();
  return jsonOk({
    ok: true,
    sent: result.sent,
    start: result.window.start.toISOString(),
    end: result.window.end.toISOString(),
  });
}
