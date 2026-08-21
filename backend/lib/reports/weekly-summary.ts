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

export function formatWeeklyReportMessage(
  businessName: string,
  summary: WeeklySummary,
  plan: string = "core",
): string {
  const avg = summary.averageRating == null ? "—" : `${summary.averageRating}/5`;
  const supportLine =
    plan === "premium"
      ? "Premium support: reply to this message and Commiters will follow up the same day."
      : "Upgrade to Premium (₹999/mo) for weekly proof plus priority support.";

  return [
    `TrustTap weekly report — ${businessName}`,
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
    "Powered by Commiters TrustTap",
  ].join("\n");
}
