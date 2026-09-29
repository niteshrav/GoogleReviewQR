import { createFloor } from "@backend/routes/dinepro";

export async function POST(request: Request) {
  return createFloor(request);
}
