import { createMenuItemHandler, listMenuItemsHandler } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return listMenuItemsHandler(request);
}

export async function POST(request: Request) {
  return createMenuItemHandler(request);
}
