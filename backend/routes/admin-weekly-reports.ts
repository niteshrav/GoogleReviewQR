import { jsonError, jsonOk } from "@backend/lib/http";
import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { sendWeeklyReports } from "@backend/lib/reports/send-weekly-reports";

export async function sendAdminWeeklyReport(request: Request) {
  if (!(await isAdminAuthorizedFromHeader(request))) {
    return jsonError("Unauthorized", 401);
  }

  const body = (await request.json().catch(() => ({}))) as {
    businessId?: unknown;
    force?: unknown;
  };
  const businessId = typeof body.businessId === "string" ? body.businessId : undefined;

  const result = await sendWeeklyReports({
    force: body.force !== false,
    businessId,
  });

  return jsonOk({
    ok: true,
    sent: result.sent,
    results: result.results,
    start: result.window.start.toISOString(),
    end: result.window.end.toISOString(),
  });
}
