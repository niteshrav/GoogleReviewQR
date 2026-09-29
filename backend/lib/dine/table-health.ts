/**
 * Internal operational Table Health score (0–100).
 * Not an objective customer truth — used for ops prioritization only.
 *
 * Weights (configurable via opts):
 * - overallAvg     35%
 * - serviceAvg     20%
 * - foodAvg        15%
 * - waitTimeAvg    15%
 * - openIssues penalty
 * - recent issue frequency penalty
 */

export type TableHealthInput = {
  overallRatings: number[];
  foodRatings: number[];
  serviceRatings: number[];
  waitTimeRatings: number[];
  openIssueCount: number;
  issuesLast7Days: number;
};

export type TableHealthWeights = {
  overall: number;
  service: number;
  food: number;
  waitTime: number;
  openIssuePenalty: number;
  recentIssuePenalty: number;
};

export const DEFAULT_TABLE_HEALTH_WEIGHTS: TableHealthWeights = {
  overall: 0.35,
  service: 0.2,
  food: 0.15,
  waitTime: 0.15,
  openIssuePenalty: 8,
  recentIssuePenalty: 4,
};

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Convert 1–5 star average to 0–100. */
function starsToScore(stars: number | null, fallback = 70): number {
  if (stars == null) return fallback;
  return Math.max(0, Math.min(100, ((stars - 1) / 4) * 100));
}

export function calculateTableHealthScore(
  input: TableHealthInput,
  weights: TableHealthWeights = DEFAULT_TABLE_HEALTH_WEIGHTS,
): {
  score: number;
  sampleSize: number;
  breakdown: {
    overallComponent: number;
    serviceComponent: number;
    foodComponent: number;
    waitTimeComponent: number;
    penalties: number;
  };
} {
  const sampleSize = input.overallRatings.length;
  const overallComponent = starsToScore(avg(input.overallRatings));
  const serviceComponent = starsToScore(avg(input.serviceRatings), overallComponent);
  const foodComponent = starsToScore(avg(input.foodRatings), overallComponent);
  const waitTimeComponent = starsToScore(avg(input.waitTimeRatings), overallComponent);

  const ratingWeight =
    weights.overall + weights.service + weights.food + weights.waitTime;
  const blended =
    (overallComponent * weights.overall +
      serviceComponent * weights.service +
      foodComponent * weights.food +
      waitTimeComponent * weights.waitTime) /
    (ratingWeight || 1);

  const penalties =
    input.openIssueCount * weights.openIssuePenalty +
    Math.min(input.issuesLast7Days, 5) * weights.recentIssuePenalty;

  const score = Math.max(0, Math.min(100, Math.round(blended - penalties)));

  return {
    score,
    sampleSize,
    breakdown: {
      overallComponent: Math.round(overallComponent),
      serviceComponent: Math.round(serviceComponent),
      foodComponent: Math.round(foodComponent),
      waitTimeComponent: Math.round(waitTimeComponent),
      penalties: Math.round(penalties),
    },
  };
}

/** Live floor pulse status from recent feedback + open issues. */
export type FloorPulseStatus = "green" | "yellow" | "red" | "gray";

export function deriveFloorPulseStatus(input: {
  openHighIssues: number;
  openMediumIssues: number;
  latestOverallRating: number | null;
  hoursSinceLastFeedback: number | null;
}): { status: FloorPulseStatus; label: string } {
  if (input.openHighIssues > 0) {
    return { status: "red", label: "Issue reported" };
  }
  if (input.openMediumIssues > 0 || (input.latestOverallRating != null && input.latestOverallRating <= 2)) {
    return { status: "yellow", label: "Attention needed" };
  }
  if (input.latestOverallRating != null && input.latestOverallRating >= 4) {
    return { status: "green", label: "Good" };
  }
  if (input.hoursSinceLastFeedback == null || input.hoursSinceLastFeedback > 24) {
    return { status: "gray", label: "No activity" };
  }
  if (input.latestOverallRating != null && input.latestOverallRating === 3) {
    return { status: "yellow", label: "Attention needed" };
  }
  return { status: "green", label: "Good" };
}
