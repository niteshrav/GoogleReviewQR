import Link from "next/link";
import { ProoflynLogo } from "@frontend/components/brand/prooflyn-logo";

export default function ReviewNotFound() {
  return (
    <main className="relative min-h-[100dvh] bg-white text-[#0a2e50]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center px-5 py-16 text-center sm:max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight">This feedback link is not available</h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-[#506070]">
          The business may be inactive or the QR code may be outdated.
        </p>
        <Link
          href="/"
          className="customer-cta mt-8 flex items-center justify-center rounded-2xl bg-[#0a2e50] px-4 py-3 text-base font-semibold text-white"
        >
          Go to Prooflyn home
        </Link>
        <footer className="mt-auto flex flex-col items-center gap-2 pt-16">
          <p className="text-xs font-medium text-[#506070]">Powered by</p>
          <ProoflynLogo variant="horizontal" markClassName="h-8 w-auto" />
        </footer>
      </div>
    </main>
  );
}
