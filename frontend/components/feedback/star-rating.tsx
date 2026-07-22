"use client";

import { cn } from "@frontend/lib/cn";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className={cn(
            "min-h-[44px] min-w-[44px] h-11 w-11 rounded-full text-lg transition-all duration-200 active:scale-95",
            value >= star
              ? "bg-brand text-white shadow-sm shadow-blue-200"
              : "bg-slate-100 text-muted hover:bg-slate-200",
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
}
