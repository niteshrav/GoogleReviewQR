import { describe, expect, it } from "vitest";
import { countEntriesByDay } from "@backend/lib/reports/activity-by-day";

describe("countEntriesByDay", () => {
  it("buckets feedback into local calendar days", () => {
    const now = new Date("2026-08-14T15:00:00");
    const today = new Date(now);
    today.setHours(9, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const buckets = countEntriesByDay(
      [{ createdAt: today }, { createdAt: today }, { createdAt: yesterday }],
      3,
      now,
    );

    expect(buckets).toHaveLength(3);
    expect(buckets[2]?.count).toBe(2);
    expect(buckets[1]?.count).toBe(1);
    expect(buckets[0]?.count).toBe(0);
  });
});
