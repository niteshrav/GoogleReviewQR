import {
  GetStartedShell,
  GetStartedWizard,
} from "@frontend/components/signup/get-started-wizard";

export const dynamic = "force-dynamic";

type GetStartedPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function GetStartedPage({ searchParams }: GetStartedPageProps) {
  const { plan } = await searchParams;
  const initialPlanKey = plan?.trim() || "core";

  return (
    <GetStartedShell>
      <GetStartedWizard initialPlanKey={initialPlanKey} />
    </GetStartedShell>
  );
}
