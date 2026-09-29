import { getAnalytics } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return getAnalytics(request);
}
