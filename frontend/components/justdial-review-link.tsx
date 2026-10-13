import { cn } from "@frontend/lib/cn";

type JustdialReviewLinkProps = {
  justdialReviewUrl: string | null | undefined;
  label?: string;
  className?: string;
};

export function JustdialReviewLink({
  justdialReviewUrl,
  label = "Rate us on Justdial",
  className = "customer-cta block rounded-xl border border-border bg-white px-4 py-3.5 text-center font-medium text-foreground transition-colors hover:bg-background active:bg-brand-soft",
}: JustdialReviewLinkProps) {
  if (!justdialReviewUrl) {
    return null;
  }

  return (
    <a
      href={justdialReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
    >
      {label}
    </a>
  );
}
