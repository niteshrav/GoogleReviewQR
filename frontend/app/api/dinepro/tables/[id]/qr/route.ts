import { downloadTableQr } from "@backend/routes/dinepro";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return downloadTableQr(request, context.params);
}
