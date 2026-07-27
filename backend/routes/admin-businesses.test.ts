import { beforeEach, describe, expect, it, vi } from "vitest";
import { DuplicateSlugError } from "@database/errors";

vi.mock("@backend/lib/auth/require-admin", () => ({
  isAdminAuthorizedFromHeader: vi.fn(),
}));

vi.mock("@backend/lib/services/index", () => ({
  businessService: {
    listBusinesses: vi.fn(),
    createBusiness: vi.fn(),
    updateBusiness: vi.fn(),
    deactivateBusiness: vi.fn(),
    deleteBusiness: vi.fn(),
  },
}));

import { isAdminAuthorizedFromHeader } from "@backend/lib/auth/require-admin";
import { businessService } from "@backend/lib/services/index";
import {
  createAdminBusiness,
  deactivateAdminBusiness,
  deleteAdminBusiness,
  listAdminBusinesses,
  updateAdminBusiness,
} from "@backend/routes/admin-businesses";

describe("admin-businesses routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for unauthorized list request", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockReturnValue(false);

    const response = await listAdminBusinesses(new Request("http://localhost/api/admin/businesses"));

    expect(response.status).toBe(401);
  });

  it("returns businesses for authorized list request", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockReturnValue(true);
    vi.mocked(businessService.listBusinesses).mockResolvedValue([{ id: "biz-1" }] as never);

    const response = await listAdminBusinesses(new Request("http://localhost/api/admin/businesses"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.businesses).toHaveLength(1);
  });

  it("returns 201 when creating a business", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockReturnValue(true);
    vi.mocked(businessService.createBusiness).mockResolvedValue({
      id: "biz-1",
      slug: "cafe-edelweiss",
    } as never);

    const response = await createAdminBusiness(
      new Request("http://localhost/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Cafe Edelweiss",
          slug: "cafe-edelweiss",
          ownerEmail: "owner@example.com",
          ownerWhatsApp: "+919876543210",
          googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
        }),
      }),
    );

    expect(response.status).toBe(201);
  });

  it("returns 409 for duplicate slug", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockReturnValue(true);
    vi.mocked(businessService.createBusiness).mockRejectedValue(new DuplicateSlugError("taken"));

    const response = await createAdminBusiness(
      new Request("http://localhost/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test",
          slug: "taken",
          ownerEmail: "owner@example.com",
          ownerWhatsApp: "+919876543210",
          googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
        }),
      }),
    );

    expect(response.status).toBe(409);
  });

  it("updates a business", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockReturnValue(true);
    vi.mocked(businessService.updateBusiness).mockResolvedValue({ id: "biz-1" } as never);

    const response = await updateAdminBusiness(
      new Request("http://localhost/api/admin/businesses/biz-1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      }),
      "biz-1",
    );

    expect(response.status).toBe(200);
  });

  it("deactivates a business", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockReturnValue(true);
    vi.mocked(businessService.deactivateBusiness).mockResolvedValue({
      id: "biz-1",
      isActive: false,
    } as never);

    const response = await deactivateAdminBusiness(
      new Request("http://localhost/api/admin/businesses/biz-1/deactivate", {
        method: "PATCH",
      }),
      "biz-1",
    );

    expect(response.status).toBe(200);
  });

  it("deletes a business", async () => {
    vi.mocked(isAdminAuthorizedFromHeader).mockReturnValue(true);
    vi.mocked(businessService.deleteBusiness).mockResolvedValue({
      id: "biz-1",
      slug: "cafe-demo",
    } as never);

    const response = await deleteAdminBusiness(
      new Request("http://localhost/api/admin/businesses/biz-1", {
        method: "DELETE",
      }),
      "biz-1",
    );

    expect(response.status).toBe(200);
    expect(businessService.deleteBusiness).toHaveBeenCalledWith("biz-1");
  });
});
