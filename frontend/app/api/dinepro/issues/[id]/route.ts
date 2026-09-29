import { resolveIssueHandler } from "@backend/routes/dinepro";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  return resolveIssueHandler(request, context.params);
}
