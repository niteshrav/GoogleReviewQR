import { updateAdminBusiness, deleteAdminBusiness } from "@backend/routes/admin-businesses";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return updateAdminBusiness(request, id);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return deleteAdminBusiness(request, id);
}
