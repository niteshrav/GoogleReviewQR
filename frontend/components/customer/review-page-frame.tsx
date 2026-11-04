import { ReactNode } from "react";
import { ProoflynLogo } from "@frontend/components/brand/prooflyn-logo";
import { BusinessLogo } from "@frontend/components/customer/business-logo";

type ReviewPageFrameProps = {
  name: string;
  logoUrl?: string | null;
  tagline?: string | null;
  children: ReactNode;
};

export function ReviewPageFrame({ name, logoUrl, tagline, children }: ReviewPageFrameProps) {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-white text-[#0a2e50]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(30,136,229,0.16), transparent 32%), radial-gradient(circle at 92% 18%, rgba(10,46,80,0.10), transparent 28%), radial-gradient(circle at 80% 88%, rgba(30,136,229,0.12), transparent 30%)",
        }}
      />
      <div className="pointer-events-none absolute -left-16 top-24 h-40 w-40 rounded-full bg-[#1e88e5]/10 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -right-10 bottom-16 h-48 w-48 rounded-full bg-[#0a2e50]/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:max-w-xl sm:px-8">
        <div className="flex flex-col items-center text-center">
          <BusinessLogo name={name} logoUrl={logoUrl} />
          <p className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">{name}</p>
          {tagline ? <p className="mt-1 max-w-sm text-sm text-[#506070]">{tagline}</p> : null}
        </div>

        {children}

        <footer className="mt-auto flex flex-col items-center gap-2 pt-10 text-center">
          <p className="text-xs font-medium text-[#506070]">Powered by</p>
          <ProoflynLogo variant="horizontal" className="text-sm" markClassName="h-8 w-auto" />
        </footer>
      </div>
    </main>
  );
}
