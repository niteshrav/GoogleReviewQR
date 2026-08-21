import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@backend/lib/env", () => ({
  getEnv: () => ({
    CRON_SECRET: "cron-secret",
    ADMIN_SECRET: "change-me-to-a-long-random-string",
  }),
}));

vi.mock("@backend/lib/reports/send-weekly-reports", () => ({
  sendWeeklyReports: vi.fn(),
}));

import { sendWeeklyReports } from "@backend/lib/reports/send-weekly-reports";
import { runWeeklyReports } from "@backend/routes/cron-weekly-reports";

describe("runWeeklyReports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing bearer secret", async () => {
    const response = await runWeeklyReports(new Request("http://localhost/api/cron/weekly-reports"));
    expect(response.status).toBe(401);
  });

  it("runs reports when authorized", async () => {
    vi.mocked(sendWeeklyReports).mockResolvedValue({
      window: {
        start: new Date("2026-08-07T00:00:00.000Z"),
        end: new Date("2026-08-14T00:00:00.000Z"),
      },
      sent: 2,
      results: [],
    });

    const response = await runWeeklyReports(
      new Request("http://localhost/api/cron/weekly-reports", {
        headers: { authorization: "Bearer cron-secret" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.sent).toBe(2);
  });
});
