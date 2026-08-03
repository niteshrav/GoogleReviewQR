import { getEnv } from "@backend/lib/env";
import { jsonError, jsonOk } from "@backend/lib/http";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientIp,
} from "@backend/lib/rate-limit";
import { feedbackInputSchema } from "@backend/lib/validators";
import { feedbackService } from "@backend/lib/services/index";

export async function submitFeedback(request: Request) {
  const env = getEnv();
  const body = await request.json().catch(() => null);
  const parsed = feedbackInputSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid feedback payload", 400);
  }

  if (parsed.data.honeypot) {
    return jsonError("Invalid submission", 400);
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(
    buildRateLimitKey("feedback", ip, parsed.data.businessSlug),
    env.RATE_LIMIT_FEEDBACK_MAX,
    env.RATE_LIMIT_FEEDBACK_WINDOW_SECONDS,
  );

  if (!rateLimit.allowed) {
    return jsonError("Too many submissions. Please try again later.", 429);
  }

  const comment =
    parsed.data.comment && parsed.data.comment.length > env.COMMENT_MAX_CHARS
      ? parsed.data.comment.slice(0, env.COMMENT_MAX_CHARS)
      : parsed.data.comment;

  const result = await feedbackService.submitPrivateFeedback({
    businessSlug: parsed.data.businessSlug,
    rating: parsed.data.rating,
    comment,
    customerPhone: parsed.data.customerPhone?.trim() || null,
  });

  if (!result) {
    return jsonError("Business not found", 404);
  }

  return jsonOk({ ok: true, feedbackId: result.feedbackId }, 201);
}
