import { describe, expect, it } from "vitest";
import {
  feedbackInputSchema,
  googleClickInputSchema,
  googleReviewUrlSchema,
  slugSchema,
} from "@backend/lib/validators";

describe("slugSchema", () => {
  it("accepts lowercase hyphenated slugs", () => {
    expect(slugSchema.parse("cafe-edelweiss")).toBe("cafe-edelweiss");
  });

  it("rejects uppercase characters", () => {
    expect(slugSchema.safeParse("Cafe-Edelweiss").success).toBe(false);
  });
});

describe("googleReviewUrlSchema", () => {
  it("accepts Google writereview URLs", () => {
    const url = "https://search.google.com/local/writereview?placeid=ChIJ123";
    expect(googleReviewUrlSchema.parse(url)).toBe(url);
  });

  it("rejects non-Google URLs", () => {
    expect(googleReviewUrlSchema.safeParse("https://example.com/review").success).toBe(false);
  });
});

describe("feedbackInputSchema", () => {
  it("accepts valid feedback payloads", () => {
    const parsed = feedbackInputSchema.parse({
      businessSlug: "cafe-edelweiss",
      rating: 2,
      comment: "Slow service",
    });

    expect(parsed.rating).toBe(2);
  });

  it("rejects ratings outside 1-5", () => {
    expect(
      feedbackInputSchema.safeParse({
        businessSlug: "cafe-edelweiss",
        rating: 6,
      }).success,
    ).toBe(false);
  });
});

describe("googleClickInputSchema", () => {
  it("accepts a business slug", () => {
    expect(
      googleClickInputSchema.parse({
        businessSlug: "jmb-cafe",
      }).businessSlug,
    ).toBe("jmb-cafe");
  });
});
