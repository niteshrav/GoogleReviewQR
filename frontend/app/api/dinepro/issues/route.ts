import { listIssuesHandler } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return listIssuesHandler(request);
}
