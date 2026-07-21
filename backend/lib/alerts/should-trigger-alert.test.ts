import { describe, expect, it } from "vitest";
import { shouldTriggerAlert } from "@backend/lib/alerts/should-trigger-alert";

describe("shouldTriggerAlert", () => {
  it("returns true for ratings 1, 2, and 3", () => {
    expect(shouldTriggerAlert(1)).toBe(true);
    expect(shouldTriggerAlert(2)).toBe(true);
    expect(shouldTriggerAlert(3)).toBe(true);
  });

  it("returns false for ratings 4 and 5", () => {
    expect(shouldTriggerAlert(4)).toBe(false);
    expect(shouldTriggerAlert(5)).toBe(false);
  });
});
