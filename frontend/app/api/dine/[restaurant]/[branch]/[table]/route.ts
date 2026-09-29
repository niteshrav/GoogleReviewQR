import { getPublicTableContext } from "@backend/routes/dinepro";

type Ctx = {
  params: Promise<{ restaurant: string; branch: string; table: string }>;
};

export async function GET(request: Request, context: Ctx) {
  return getPublicTableContext(request, context.params);
}
