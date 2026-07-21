import { afterEach, describe, expect, it } from "vitest";
import {
  buildRateLimitKey,
  checkRateLimit,
  getClientIp,
  resetRateLimitStoreForTests,
} from "@backend/lib/rate-limit";

describe("rate-limit", () => {
  afterEach(() => {
    resetRateLimitStoreForTests();
  });

  it("allows requests until the max is reached", () => {
    const key = buildRateLimitKey("feedback", "127.0.0.1", "cafe-edelweiss");

    expect(checkRateLimit(key, 2, 60).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60).allowed).toBe(false);
  });

  it("extracts the first forwarded IP", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "203.0.113.1, 70.41.3.18",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.1");
  });
});
