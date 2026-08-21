import { HTMLAttributes } from "react";
import { cn } from "@frontend/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "error" | "brand" | "overdue" | "premium";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  brand: "bg-brand-soft text-brand",
  overdue: "bg-red-100 text-red-700 border border-red-200",
  premium: "bg-amber-50 text-amber-700 border border-amber-200",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
