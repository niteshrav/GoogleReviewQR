import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { businessService } from "@backend/lib/services/index";
import { getEnv } from "@backend/lib/env";
import { buildBusinessReviewUrl, generateQrPngBuffer } from "@backend/lib/qr/generate-qr";
import { jsonError } from "@backend/lib/http";

export async function downloadAdminQr(request: Request, slug: string) {
  if (!isAdminAuthorizedFromHeader(request)) {
    return jsonError("Unauthorized", 401);
  }

  const business = await businessService.getBusinessBySlug(slug);

  if (!business) {
    return jsonError("Business not found", 404);
  }

  const env = getEnv();
  const url = buildBusinessReviewUrl(env.BASE_URL, business.slug);
  const png = await generateQrPngBuffer(url);
  const preview = new URL(request.url).searchParams.get("preview") === "1";

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": preview
        ? `inline; filename="${business.slug}-qr.png"`
        : `attachment; filename="${business.slug}-qr.png"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
