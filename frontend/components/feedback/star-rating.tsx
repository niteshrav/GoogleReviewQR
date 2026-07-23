"use client";

import { cn } from "@frontend/lib/cn";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div
      className="flex w-full max-w-sm items-center justify-between gap-1.5 sm:max-w-none sm:justify-start sm:gap-2"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className={cn(
            "flex min-h-[44px] min-w-[44px] flex-1 items-center justify-center rounded-full text-lg transition-all duration-200 active:scale-95 sm:h-11 sm:w-11 sm:flex-none",
            value >= star
              ? "bg-brand text-white shadow-sm"
              : "bg-slate-100 text-muted hover:bg-slate-200",
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}
