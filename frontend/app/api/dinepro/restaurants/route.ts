import { listDineRestaurants } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return listDineRestaurants(request);
}
