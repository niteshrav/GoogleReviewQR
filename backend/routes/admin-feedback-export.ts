import { jsonError, jsonOk } from "@backend/lib/http";
import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { feedbackService } from "@backend/lib/services/index";
import { feedbackToCsv } from "@backend/lib/csv/feedback-csv";

export async function exportAdminFeedbackCsv(request: Request) {
  if (!(await isAdminAuthorizedFromHeader(request))) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return jsonError("businessId query parameter is required", 400);
  }

  const feedback = await feedbackService.listFeedbackForBusiness(businessId);
  const csv = feedbackToCsv(feedback);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trusttap-feedback-${businessId}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
