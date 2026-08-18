import { TrustTapLogo } from "@frontend/components/brand/trusttap-logo";

type CustomerFooterProps = {
  className?: string;
};

export function CustomerFooter({ className = "" }: CustomerFooterProps) {
  return (
    <footer className={`mt-auto flex flex-col items-center gap-2 pt-8 text-center text-xs text-muted ${className}`}>
      <TrustTapLogo variant="wordmark" tagline className="text-[13px]" />
      <p>
        Powered by{" "}
        <a
          href="https://commiters.com"
          className="font-medium text-brand hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Commiters
        </a>
      </p>
    </footer>
  );
}
