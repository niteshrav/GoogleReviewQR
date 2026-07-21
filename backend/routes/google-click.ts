import { jsonError, jsonOk } from "@backend/lib/http";
import { googleClickInputSchema } from "@backend/lib/validators";
import { feedbackService } from "@backend/lib/services/index";

export async function logGoogleClick(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = googleClickInputSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }

  const result = await feedbackService.logGoogleClick(parsed.data.businessSlug);

  if (!result) {
    return jsonError("Business not found", 404);
  }

  return jsonOk({ ok: true, feedbackId: result.feedbackId }, 201);
}
