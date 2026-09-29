import { getTableDetail, patchTable } from "@backend/routes/dinepro";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return getTableDetail(request, context.params);
}

export async function PATCH(request: Request, context: Ctx) {
  return patchTable(request, context.params);
}
