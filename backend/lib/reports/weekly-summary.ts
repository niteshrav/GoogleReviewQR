import {
  escapeHtml,
  renderEmailNote,
  renderEmailRows,
  renderProoflynEmail,
} from "@backend/lib/email/layout";

export type WeeklyFeedbackItem = {
  createdAt: Date;
  rating: number | null;
  clickedGoogle: boolean;
  alertSentAt: Date | null;
};

export type WeeklySummary = {
  start: Date;
  end: Date;
  totalEntries: number;
  googleClicks: number;
  privateFeedback: number;
  lowRatings: number;
  alertsSent: number;
  averageRating: number | null;
};

export function getLastSevenDaysWindow(now = new Date()): { start: Date; end: Date } {
  const end = now;
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function summarizeFeedbackWeek(
  items: WeeklyFeedbackItem[],
  window: { start: Date; end: Date },
): WeeklySummary {
  const inWindow = items.filter(
    (item) => item.createdAt >= window.start && item.createdAt <= window.end,
  );
  const rated = inWindow.filter((item) => typeof item.rating === "number");
  const averageRating =
    rated.length > 0
      ? Number(
          (rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length).toFixed(1),
        )
      : null;

  return {
    start: window.start,
    end: window.end,
    totalEntries: inWindow.length,
    googleClicks: inWindow.filter((item) => item.clickedGoogle).length,
    privateFeedback: rated.length,
    lowRatings: rated.filter((item) => (item.rating ?? 6) <= 3).length,
    alertsSent: inWindow.filter((item) => Boolean(item.alertSentAt)).length,
    averageRating,
  };
}

function formatReportDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function weeklyReportSupportLine(plan: string): string {
  return plan === "premium"
    ? "Premium support: reply to this message and Commiters will follow up the same day."
    : "Upgrade to Premium (₹999/mo) for weekly proof plus priority support.";
}

export function formatWeeklyReportHtml(
  businessName: string,
  summary: WeeklySummary,
  plan: string = "core",
): string {
  const avg = summary.averageRating == null ? "—" : `${summary.averageRating}/5`;
  const period = `${formatReportDate(summary.start)} – ${formatReportDate(summary.end)}`;

  const body = [
    renderEmailRows([
      { label: "QR activity", value: String(summary.totalEntries) },
      { label: "Google review taps", value: String(summary.googleClicks) },
      { label: "Private feedback", value: String(summary.privateFeedback) },
      { label: "Average private rating", value: avg },
      { label: "Low ratings (3 or below)", value: String(summary.lowRatings) },
      { label: "Owner alerts sent", value: String(summary.alertsSent) },
    ]),
    renderEmailNote(escapeHtml(weeklyReportSupportLine(plan))),
    `<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#506070;">Google reviews stay ungated — every customer can still post publicly.</p>`,
  ].join("");

  return renderProoflynEmail({
    eyebrow: "Weekly report",
    title: escapeHtml(businessName),
    intro: escapeHtml(period),
    bodyHtml: body,
  });
}

export function formatWeeklyReportMessage(
  businessName: string,
  summary: WeeklySummary,
  plan: string = "core",
): string {
  const avg = summary.averageRating == null ? "—" : `${summary.averageRating}/5`;
  const supportLine = weeklyReportSupportLine(plan);

  return [
    `Prooflyn weekly report — ${businessName}`,
    `Period: ${summary.start.toISOString().slice(0, 10)} to ${summary.end.toISOString().slice(0, 10)}`,
    `QR activity (clicks + private notes): ${summary.totalEntries}`,
    `Google review taps: ${summary.googleClicks}`,
    `Private feedback: ${summary.privateFeedback}`,
    `Average private rating: ${avg}`,
    `Low ratings (≤3): ${summary.lowRatings}`,
    `Owner alerts sent: ${summary.alertsSent}`,
    "",
    supportLine,
    "Google reviews stay ungated — every customer can still post publicly.",
    "Powered by Commiters Prooflyn",
  ].join("\n");
}
