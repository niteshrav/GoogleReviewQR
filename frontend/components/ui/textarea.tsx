"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@frontend/lib/cn";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, hint, error, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-border bg-white px-3.5 py-3 text-base text-foreground outline-none transition-shadow placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-[var(--ring)] disabled:bg-slate-100",
          error && "border-error focus:border-error focus:ring-red-200",
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint && !error ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});
