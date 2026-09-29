import { createTable, listTables } from "@backend/routes/dinepro";

export async function GET(request: Request) {
  return listTables(request);
}

export async function POST(request: Request) {
  return createTable(request);
}
