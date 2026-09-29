import { listDineContext } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return listDineContext(request);
}
