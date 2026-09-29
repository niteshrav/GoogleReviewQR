import { describe, expect, it } from "vitest";
import {
  calculateTableHealthScore,
  deriveFloorPulseStatus,
} from "@backend/lib/dine/table-health";
import {
  mapIssueTagToCategory,
  severityFromRatings,
  slugifyLabel,
} from "@backend/lib/dine/dine-service";
import { buildTableQrUrl, DINEPRO_PLAN_KEY } from "@backend/lib/dine/access";

describe("calculateTableHealthScore", () => {
  it("scores high when ratings are strong and no issues", () => {
    const result = calculateTableHealthScore({
      overallRatings: [5, 5, 4, 5],
      foodRatings: [5, 4],
      serviceRatings: [5, 5],
      waitTimeRatings: [4, 5],
      openIssueCount: 0,
      issuesLast7Days: 0,
    });
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.sampleSize).toBe(4);
  });

  it("penalizes open and recent issues", () => {
    const healthy = calculateTableHealthScore({
      overallRatings: [4, 4, 4],
      foodRatings: [4],
      serviceRatings: [4],
      waitTimeRatings: [4],
      openIssueCount: 0,
      issuesLast7Days: 0,
    });
    const troubled = calculateTableHealthScore({
      overallRatings: [4, 4, 4],
      foodRatings: [4],
      serviceRatings: [4],
      waitTimeRatings: [4],
      openIssueCount: 2,
      issuesLast7Days: 3,
    });
    expect(troubled.score).toBeLessThan(healthy.score);
  });
});

describe("deriveFloorPulseStatus", () => {
  it("marks red for high severity open issues", () => {
    expect(
      deriveFloorPulseStatus({
        openHighIssues: 1,
        openMediumIssues: 0,
        latestOverallRating: 5,
        hoursSinceLastFeedback: 1,
      }).status,
    ).toBe("red");
  });

  it("marks gray when inactive", () => {
    expect(
      deriveFloorPulseStatus({
        openHighIssues: 0,
        openMediumIssues: 0,
        latestOverallRating: null,
        hoursSinceLastFeedback: null,
      }).status,
    ).toBe("gray");
  });
});

describe("dine helpers", () => {
  it("maps tags and severity", () => {
    expect(mapIssueTagToCategory("Waiting time")).toBe("WAIT_TIME");
    expect(
      severityFromRatings({
        overallRating: 2,
        tags: [],
      }),
    ).toBe("HIGH");
  });

  it("slugifies labels and builds QR urls", () => {
    expect(slugifyLabel("Ground Floor")).toBe("ground-floor");
    expect(buildTableQrUrl("toast-house", "udaipur", "t07", "https://trusttap.example")).toBe(
      "https://trusttap.example/dine/toast-house/udaipur/t07",
    );
    expect(DINEPRO_PLAN_KEY).toBe("dinepro");
  });
});
