"use client";

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
          className={`min-h-[44px] min-w-[44px] h-11 w-11 rounded-full text-lg ${
            value >= star ? "bg-brand text-white" : "bg-slate-100 text-muted"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
