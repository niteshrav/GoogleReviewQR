import { createBranch } from "@backend/routes/dinepro";

export async function POST(request: Request) {
  return createBranch(request);
}
