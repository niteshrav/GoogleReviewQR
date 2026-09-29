import { cn } from "@frontend/lib/cn";

export type TrustTapLogoVariant = "horizontal" | "stacked" | "mark" | "wordmark";
export type TrustTapLogoTone = "color" | "inverse" | "mono";

type TrustTapLogoProps = {
  variant?: TrustTapLogoVariant;
  tone?: TrustTapLogoTone;
  tagline?: boolean;
  className?: string;
  markClassName?: string;
};

function Wordmark({
  tone,
  tagline,
  stacked,
}: {
  tone: TrustTapLogoTone;
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
        <span className={inverse ? "text-white" : "text-navy"}>trust</span>
        <span className={inverse ? "text-sky-300" : "text-brand"}>Tap</span>
      </span>
      {tagline || stacked ? (
        <span
          className={cn(
            "mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em]",
            inverse ? "text-sky-200/90" : "text-[#5bb8e8]"
          )}
        >
          Tap. Trust. Thrive.
        </span>
      ) : null}
    </span>
  );
}

/** Official trustTap lockup — mark image + live wordmark so casing stays trustTap. */
export function TrustTapLogo({
  variant = "horizontal",
  tone = "color",
  tagline = false,
  className,
  markClassName,
}: TrustTapLogoProps) {
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
        alt="trustTap"
        className={cn("object-contain", markHeight, markClassName, className)}
      />
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("inline-flex", className)} aria-label="trustTap">
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
      aria-label="trustTap"
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

export function TrustTapMark({
  tone = "color",
  className,
  title = "trustTap",
}: {
  tone?: TrustTapLogoTone;
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
