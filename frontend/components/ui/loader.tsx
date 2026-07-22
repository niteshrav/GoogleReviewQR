import { cn } from "@frontend/lib/cn";

type LoaderProps = {
  className?: string;
  label?: string;
};

export function Loader({ className, label = "Loading" }: LoaderProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-muted", className)} role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-r-transparent" />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-200/80", className)}
      aria-hidden
    />
  );
}
