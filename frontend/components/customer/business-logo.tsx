"use client";

import { useState } from "react";

type BusinessLogoProps = {
  name: string;
  logoUrl?: string | null;
};

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (letters || name.trim().slice(0, 2) || "?").toUpperCase();
}

export function BusinessLogo({ name, logoUrl }: BusinessLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;

  if (!showImage) {
    return (
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1e88e5] to-[#0a2e50] text-2xl font-semibold text-white shadow-sm"
        aria-hidden
      >
        {initialsFor(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl ?? ""}
      alt=""
      onError={() => setFailed(true)}
      className="h-20 w-auto max-w-[220px] object-contain"
    />
  );
}
