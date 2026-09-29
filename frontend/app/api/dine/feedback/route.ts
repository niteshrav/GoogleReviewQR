import { submitDineFeedback } from "@backend/routes/dinepro";

export async function POST(request: Request) {
  return submitDineFeedback(request);
}
