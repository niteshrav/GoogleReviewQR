import { notFound } from "next/navigation";
import { dineRepository } from "@database/index";
import { CustomerPageShell } from "@frontend/components/customer/customer-page-shell";
import { CustomerFooter } from "@frontend/components/customer/customer-footer";
import { DineGuestForm } from "@frontend/components/dinepro/dine-guest-form";

type PageProps = {
  params: Promise<{ restaurant: string; branch: string; table: string }>;
};

export default async function DineGuestPage({ params }: PageProps) {
  const { restaurant, branch, table } = await params;
  const row = await dineRepository.findTableByPath(restaurant, branch, table);
  if (!row || row.branch.business.plan !== "dinepro") {
    notFound();
  }

  const menuItems = await dineRepository.listMenuItems(row.businessId, row.branchId);

  // Scan activity (best-effort; page still renders if this fails)
  try {
    await dineRepository.createActivity({
      businessId: row.businessId,
      tableId: row.id,
      type: "QR_SCAN",
      message: `Guest scanned QR for table ${row.tableNumber}`,
    });
  } catch {
    // ignore
  }

  return (
    <CustomerPageShell>
      <DineGuestForm
        restaurant={{
          name: row.branch.business.name,
          slug: row.branch.business.slug,
          googleReviewUrl: row.branch.business.googleReviewUrl,
          logoUrl: row.branch.business.logoUrl,
        }}
        branch={{ name: row.branch.name, slug: row.branch.slug }}
        table={{ number: row.tableNumber, slug: row.slug }}
        menuItems={menuItems.map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
        }))}
      />
      <CustomerFooter />
    </CustomerPageShell>
  );
}
