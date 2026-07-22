"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@frontend/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
  showPasswordToggle?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    hint,
    error,
    id,
    type = "text",
    showPasswordToggle = false,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const inputId = id ?? props.name;
  const isPassword = type === "password";
  const resolvedType = isPassword && showPasswordToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={resolvedType}
          className={cn(
            "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-base text-foreground outline-none transition-shadow placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-[var(--ring)] disabled:bg-slate-100 disabled:text-muted sm:text-sm",
            error && "border-error focus:border-error focus:ring-red-200",
            showPasswordToggle && isPassword && "pr-12",
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {showPasswordToggle && isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-muted hover:bg-slate-100 hover:text-foreground"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
