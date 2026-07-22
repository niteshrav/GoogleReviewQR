import Link from "next/link";
import { CustomerFooter } from "@frontend/components/customer/customer-footer";
import { CustomerPageShell } from "@frontend/components/customer/customer-page-shell";
import { Button } from "@frontend/components/ui/button";
import { Card } from "@frontend/components/ui/card";

export default function NotFoundPage() {
  return (
    <CustomerPageShell className="items-center justify-center text-center">
      <Card className="w-full">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
          ?
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          This feedback link is not available
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-sm">
          The business may be inactive or the QR code may be outdated.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button fullWidth size="lg">
              Go to FeedbackFlow home
            </Button>
          </Link>
        </div>
      </Card>
      <CustomerFooter />
    </CustomerPageShell>
  );
}
