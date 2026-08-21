export type CaseStudyFeedbackItem = {
  createdAt: Date;
  rating: number | null;
  comment: string | null;
  clickedGoogle: boolean;
  alertSentAt: Date | null;
};

export function getLastNDaysWindow(days: number, now = new Date()): { start: Date; end: Date } {
  const end = now;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end };
}

export function pickCaseStudyQuote(items: CaseStudyFeedbackItem[]): string | null {
  const withComment = items.filter((item) => Boolean(item.comment?.trim()));
  if (withComment.length === 0) {
    return null;
  }

  const positive = withComment.filter((item) => (item.rating ?? 0) >= 4);
  const pool = positive.length > 0 ? positive : withComment;
  const sorted = [...pool].sort(
    (a, b) => (b.comment?.trim().length ?? 0) - (a.comment?.trim().length ?? 0),
  );
  return sorted[0]?.comment?.trim() ?? null;
}
