import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shouldTriggerAlert } from "@backend/lib/alerts/should-trigger-alert";

const prohibitedPatterns = [
  /instead of leaving a review/i,
  /let us fix this instead/i,
  /rating\s*>=\s*4/i,
  /rating\s*>\s*3[\s\S]{0,80}google/i,
];

const viewFiles = [
  "frontend/views/review-page.tsx",
  "frontend/views/feedback-page.tsx",
  "frontend/components/feedback/feedback-form.tsx",
  "frontend/components/google-review-button.tsx",
];

const routeFiles = ["backend/routes/feedback.ts", "backend/routes/google-click.ts"];

describe("compliance: no review gating", () => {
  it("frontend customer views avoid prohibited gating patterns", () => {
    for (const file of viewFiles) {
      const contents = readFileSync(join(process.cwd(), file), "utf8");
      for (const pattern of prohibitedPatterns) {
        expect(contents).not.toMatch(pattern);
      }
    }
  });

  it("feedback route does not branch on rating for Google access", () => {
    const contents = readFileSync(join(process.cwd(), "backend/routes/feedback.ts"), "utf8");

    expect(contents).not.toMatch(/googleReviewUrl/);
    expect(contents).not.toMatch(/if\s*\(.*rating/);
  });

  it("shouldTriggerAlert is separate from Google CTA logic", () => {
    expect(shouldTriggerAlert(2)).toBe(true);
    expect(shouldTriggerAlert(5)).toBe(false);

    for (const file of routeFiles) {
      const contents = readFileSync(join(process.cwd(), file), "utf8");
      expect(contents).not.toContain("shouldTriggerAlert");
    }
  });

  it("landing and thank-you paths always expose Google CTA component", () => {
    const review = readFileSync(join(process.cwd(), "frontend/views/review-page.tsx"), "utf8");
    const form = readFileSync(
      join(process.cwd(), "frontend/components/feedback/feedback-form.tsx"),
      "utf8",
    );

    expect(review).toContain("GoogleReviewButton");
    expect(form).toContain("GoogleReviewButton");
  });
});
