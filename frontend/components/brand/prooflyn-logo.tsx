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
  tone,
  tagline,
  stacked,
}: {
  tone: ProoflynLogoTone;
  tagline: boolean;
  stacked: boolean;
}) {
  const inverse = tone === "inverse" || tone === "mono";
  return (
    <span
      className={cn(
        "flex min-w-0 flex-col justify-center leading-none",
        stacked ? "items-center text-center" : "items-start text-left"
      )}
    >
      <span
        className={cn(
          "font-semibold tracking-tight",
          stacked ? "text-2xl sm:text-3xl" : "text-[1.35rem] sm:text-[1.5rem]"
        )}
      >
        <span className={inverse ? "text-white" : "text-navy"}>Proof</span>
        <span className={inverse ? "text-sky-300" : "text-brand"}>lyn</span>
      </span>
      {tagline || stacked ? (
        <span
          className={cn(
            "mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em]",
            inverse ? "text-sky-200/90" : "text-[#5bb8e8]"
          )}
        >
          Prove. Improve. Grow.
        </span>
      ) : null}
    </span>
  );
}

/** Official Prooflyn lockup — mark image + live wordmark. */
export function ProoflynLogo({
  variant = "horizontal",
  tone = "color",
  tagline = false,
  className,
  markClassName,
}: ProoflynLogoProps) {
  const inverse = tone === "inverse" || tone === "mono";
  const markSrc = inverse
    ? "/images/brand/logo-mark-inverse.png"
    : "/images/brand/logo-mark.png";
  const isMark = variant === "mark";
  const showTagline = tagline || variant === "stacked";
  const markHeight = isMark
    ? "h-8 w-auto"
    : variant === "stacked"
      ? "h-12 w-auto sm:h-14"
      : showTagline
        ? "h-10 w-auto sm:h-11"
        : "h-8 w-auto sm:h-9";

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
        <Wordmark tone={tone} tagline={showTagline} stacked={false} />
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
      <Wordmark tone={tone} tagline={showTagline} stacked={variant === "stacked"} />
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
      ? "/images/brand/logo-mark-inverse.png"
      : "/images/brand/logo-mark.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={title} className={cn("h-8 w-auto object-contain", className)} />
  );
}
