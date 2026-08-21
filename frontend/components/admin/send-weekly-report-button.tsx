"use client";

import { useState } from "react";

type SendWeeklyReportButtonProps = {
  businessId?: string;
  label?: string;
};

export function SendWeeklyReportButton({
  businessId,
  label = "Send weekly report now",
}: SendWeeklyReportButtonProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [detail, setDetail] = useState<string | null>(null);

  async function send() {
    setStatus("sending");
    setDetail(null);

    const response = await fetch("/api/admin/weekly-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force: true, businessId }),
    });

    if (!response.ok) {
      setStatus("error");
      setDetail("Could not send. Check SMTP / phone alerts.");
      return;
    }

    const body = (await response.json()) as { sent?: number };
    setStatus("sent");
    setDetail(`Sent ${body.sent ?? 0} report${body.sent === 1 ? "" : "s"}.`);
    window.setTimeout(() => {
      setStatus("idle");
      setDetail(null);
    }, 5000);
  }

  const isLoading = status === "sending";
  const isSent = status === "sent";
  const isError = status === "error";

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={isLoading || isSent}
        onClick={send}
        className={[
          "inline-flex h-9 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60",
          isSent
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : isError
              ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              : "border-border bg-white text-foreground hover:bg-background",
        ].join(" ")}
      >
        {isLoading ? (
          <>
            <svg
              className="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0110 10" />
            </svg>
            Sending…
          </>
        ) : isSent ? (
          <>
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path
                fillRule="evenodd"
                d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"
                clipRule="evenodd"
              />
            </svg>
            Sent
          </>
        ) : isError ? (
          <>
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
              <path
                fillRule="evenodd"
                d="M8 1a7 7 0 100 14A7 7 0 008 1zM7.25 4.75a.75.75 0 011.5 0v3.5a.75.75 0 01-1.5 0v-3.5zm.75 7a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            Retry
          </>
        ) : (
          <>
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-muted">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            {label}
          </>
        )}
      </button>
      {detail ? (
        <p className={`text-xs ${isError ? "text-red-600" : "text-emerald-600"}`}>{detail}</p>
      ) : null}
    </div>
  );
}
