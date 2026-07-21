import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { feedbackService } from "@backend/lib/services/index";
import { jsonError, jsonOk } from "@backend/lib/http";

export async function listAdminFeedback(request: Request) {
  if (!isAdminAuthorizedFromHeader(request)) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return jsonError("businessId query parameter is required", 400);
  }

  const feedback = await feedbackService.listFeedbackForBusiness(businessId);
  return jsonOk({ feedback });
}
