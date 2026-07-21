import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@database/client", () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

import { db } from "@database/client";
import { getHealthStatus } from "@backend/routes/health";

describe("getHealthStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok when database is reachable", async () => {
    vi.mocked(db.$queryRaw).mockResolvedValue([{ "?column?": 1 }] as never);

    const response = await getHealthStatus();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("feedbackflow");
  });

  it("returns degraded when database fails", async () => {
    vi.mocked(db.$queryRaw).mockRejectedValue(new Error("connection refused"));

    const response = await getHealthStatus();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.database).toBe("unavailable");
  });
});
