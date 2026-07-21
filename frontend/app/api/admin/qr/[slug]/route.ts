import { downloadAdminQr } from "@backend/routes/admin-qr";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  return downloadAdminQr(request, slug);
}
