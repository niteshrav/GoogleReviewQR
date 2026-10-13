/** Custom-designed QR landing pages, keyed by business slug. Others use the default page. */
export type ReviewTheme = "toast-house";

const REVIEW_THEMES: Record<string, ReviewTheme> = {
  "the-toast-house": "toast-house",
};

export function getReviewTheme(slug: string): ReviewTheme | null {
  return REVIEW_THEMES[slug] ?? null;
}
