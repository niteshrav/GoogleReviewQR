"use client";

import { useEffect, useState } from "react";
import { Button } from "@frontend/components/ui/button";
import { cn } from "@frontend/lib/cn";

/** navigator.clipboard is unavailable on plain-http LAN URLs, so fall back to execCommand. */
async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

type CopyTextButtonProps = {
  text: string;
  className?: string;
};

export function CopyTextButton({ text, className }: CopyTextButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = window.setTimeout(() => setStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function handleCopy() {
    setStatus((await copyToClipboard(text)) ? "copied" : "failed");
  }

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      aria-live="polite"
      className={cn("min-h-[44px] shrink-0 px-4", className)}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h9" strokeLinecap="round" />
      </svg>
      {status === "copied" ? "Copied!" : status === "failed" ? "Couldn't copy" : "Copy"}
    </Button>
  );
}
