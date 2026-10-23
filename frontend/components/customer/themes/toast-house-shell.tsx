/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { Fraunces } from "next/font/google";
import { ProoflynLogo } from "@frontend/components/brand/prooflyn-logo";
import { cn } from "@frontend/lib/cn";

export const toastHouseSerif = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-toast-serif",
});

export const TOAST_HOUSE_ASSETS = "/themes/the-toast-house";

/** Re-points the shared design tokens so stock components (buttons, stars, inputs) turn brown. */
const THEME_VARS = {
  "--background": "#FAF7F2",
  "--foreground": "#2B2B26",
  "--brand": "#934312",
  "--brand-dark": "#7C380F",
  "--brand-soft": "#FBEFE3",
  "--navy": "#1F3A2C",
  "--muted": "#6B6B63",
  "--border": "#E7DACB",
  "--ring": "rgba(147, 67, 18, 0.25)",
} as CSSProperties;

function fade(at: string): CSSProperties {
  const mask = `radial-gradient(ellipse at ${at}, #000 38%, transparent 70%)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

function Decorations() {
  return (
    <div aria-hidden className="pointer-events-none select-none">
      <img
        src={`${TOAST_HOUSE_ASSETS}/lamp.webp`}
        alt=""
        className="absolute left-0 top-0 w-[28vw] max-w-[150px] md:w-[250px] md:max-w-none lg:w-[290px]"
        style={fade("top left")}
      />
      <img
        src={`${TOAST_HOUSE_ASSETS}/good-food-note.webp`}
        alt=""
        className="absolute right-1 top-3 w-[24vw] max-w-[110px] md:right-10 md:top-10 md:w-[190px] md:max-w-none"
      />
      <img
        src={`${TOAST_HOUSE_ASSETS}/thanks-note.webp`}
        alt=""
        className="absolute left-[7%] top-[42%] hidden w-[140px] md:block"
      />
      <img
        src={`${TOAST_HOUSE_ASSETS}/sandwich.webp`}
        alt=""
        className="absolute bottom-0 left-0 w-[44vw] max-w-[200px] md:w-[380px] md:max-w-none lg:w-[430px]"
        style={fade("bottom left")}
      />
      <img
        src={`${TOAST_HOUSE_ASSETS}/coffee.webp`}
        alt=""
        className="absolute bottom-0 right-0 w-[40vw] max-w-[190px] md:w-[360px] md:max-w-none lg:w-[410px]"
        style={fade("bottom right")}
      />
    </div>
  );
}

type ToastHouseShellProps = {
  children: ReactNode;
  /** Vertically centre content on desktop (short pages like the QR landing). */
  centered?: boolean;
};

export function ToastHouseShell({
  children,
  centered = false,
}: ToastHouseShellProps) {
  return (
    <main
      className={cn(
        toastHouseSerif.variable,
        "relative min-h-[100dvh] overflow-hidden bg-[#FAF7F2] text-[#2B2B26]",
      )}
      style={THEME_VARS}
    >
      <Decorations />
      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center px-6 pb-[max(11rem,calc(env(safe-area-inset-bottom)+10rem))] pt-[max(1.25rem,env(safe-area-inset-top))] text-center md:pb-10",
          centered && "md:justify-center",
        )}
      >
        {children}
      </div>
    </main>
  );
}

export function ToastHouseFooter() {
  return (
    <footer
      className="mt-6 flex flex-col items-center gap-1 text-[11px] text-[#6B6B63]"
      style={{ "--brand": "#1e88e5", "--navy": "#0a2e50" } as CSSProperties}
    >
      <span>Powered by</span>
      <ProoflynLogo variant="wordmark" tagline className="text-[13px]" />
    </footer>
  );
}
