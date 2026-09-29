import { getFloorPulse } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return getFloorPulse(request);
}
