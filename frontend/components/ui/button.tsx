"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@frontend/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow-md active:scale-[0.98]",
  secondary:
    "bg-secondary text-white shadow-sm hover:bg-secondary-dark hover:shadow-md active:scale-[0.98]",
  outline:
    "border border-border bg-card text-foreground hover:bg-background active:scale-[0.98]",
  ghost: "text-foreground hover:bg-brand-soft active:scale-[0.98]",
  danger:
    "border border-red-200 bg-red-50 text-error hover:bg-red-100 active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm rounded-xl",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-xl",
  lg: "min-h-12 px-5 py-3 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    children,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
});
