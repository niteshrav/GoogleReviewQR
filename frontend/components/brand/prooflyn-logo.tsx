import { cn } from "@frontend/lib/cn";

export type ProoflynLogoVariant = "horizontal" | "stacked" | "mark" | "wordmark";
export type ProoflynLogoTone = "color" | "inverse" | "mono";

type ProoflynLogoProps = {
  variant?: ProoflynLogoVariant;
  tone?: ProoflynLogoTone;
  tagline?: boolean;
  className?: string;
  markClassName?: string;
};

function Wordmark({
  inverse,
  tagline,
  stacked,
}: {
  inverse: boolean;
  tagline: boolean;
  stacked: boolean;
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 flex-col justify-center leading-none",
        stacked ? "items-center text-center" : "items-start text-left"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={inverse ? "/images/brand/prooflyn-word-inverse.png" : "/images/brand/prooflyn-word.png"}
        alt=""
        className={cn("w-auto object-contain", tagline ? "h-6 sm:h-7" : "h-7 sm:h-8")}
      />
      {tagline ? (
        <span
          className={cn(
            "mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em]",
            inverse ? "text-white/80" : "text-[#506070]"
          )}
        >
          Prove. Improve. Grow.
        </span>
      ) : null}
    </span>
  );
}

/** Official Prooflyn lockup — supplied mark and wordmark. */
export function ProoflynLogo({
  variant = "horizontal",
  tone = "color",
  tagline = false,
  className,
  markClassName,
}: ProoflynLogoProps) {
  const inverse = tone === "inverse" || tone === "mono";
  const markSrc = inverse
    ? "/images/brand/prooflyn-mark-inverse.png"
    : "/images/brand/prooflyn-mark.png";
  const isMark = variant === "mark";
  const showTagline = tagline || variant === "stacked";
  const markHeight = isMark
    ? "h-10 w-auto"
    : variant === "stacked"
      ? "h-14 w-auto sm:h-16"
      : showTagline
        ? "h-11 w-auto sm:h-12"
        : "h-9 w-auto sm:h-10";

  if (isMark) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={markSrc}
        alt="Prooflyn"
        className={cn("object-contain", markHeight, markClassName, className)}
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("inline-flex", className)} aria-label="Prooflyn">
        <Wordmark inverse={inverse} tagline={showTagline} stacked={false} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-none shrink-0",
        variant === "stacked" ? "flex-col items-center gap-2" : "items-center gap-2.5",
        className
      )}
      aria-label="Prooflyn"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={markSrc}
        alt=""
        aria-hidden
        className={cn("shrink-0 object-contain", markHeight, markClassName)}
      />
      <Wordmark inverse={inverse} tagline={showTagline} stacked={variant === "stacked"} />
    </span>
  );
}

export function ProoflynMark({
  tone = "color",
  className,
  title = "Prooflyn",
}: {
  tone?: ProoflynLogoTone;
  className?: string;
  title?: string;
}) {
  const src =
    tone === "inverse" || tone === "mono"
      ? "/images/brand/prooflyn-mark-inverse.png"
      : "/images/brand/prooflyn-mark.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={title} className={cn("h-8 w-auto object-contain", className)} />
  );
}
