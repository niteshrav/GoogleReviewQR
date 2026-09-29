import { getOverview } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return getOverview(request);
}
