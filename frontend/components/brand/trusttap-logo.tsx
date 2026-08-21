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

function srcFor({
  variant,
  tone,
  tagline,
}: {
  variant: TrustTapLogoVariant;
  tone: TrustTapLogoTone;
  tagline: boolean;
}) {
  const inverse = tone === "inverse" || tone === "mono";
  if (variant === "mark") {
    return inverse ? "/images/brand/logo-mark-inverse.png" : "/images/brand/logo-mark.png";
  }
  if (tagline || variant === "stacked") {
    return inverse ? "/images/brand/logo-inverse.png" : "/images/brand/logo.png";
  }
  return inverse ? "/images/brand/logo-compact-inverse.png" : "/images/brand/logo-compact.png";
}

/** Official TrustTap lockup extracted from brand artwork (image 2). */
export function TrustTapLogo({
  variant = "horizontal",
  tone = "color",
  tagline = false,
  className,
  markClassName,
}: TrustTapLogoProps) {
  const src = srcFor({ variant, tone, tagline });
  const isMark = variant === "mark";
  const heightClass = isMark
    ? "h-8"
    : variant === "stacked"
      ? "h-14 sm:h-16"
      : tagline
        ? "h-11 sm:h-12"
        : "h-8 sm:h-9";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="TrustTap"
      className={cn(
        "w-auto max-w-none shrink-0 object-contain object-left",
        heightClass,
        isMark ? markClassName : className,
      )}
    />
  );
}

export function TrustTapMark({
  tone = "color",
  className,
  title = "TrustTap",
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
