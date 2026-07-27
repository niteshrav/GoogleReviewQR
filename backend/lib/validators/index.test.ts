import { describe, expect, it } from "vitest";
import {
  feedbackInputSchema,
  googleClickInputSchema,
  googleReviewUrlSchema,
  slugSchema,
  businessInputSchema,
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

describe("businessInputSchema", () => {
  it("requires at least one owner phone for alerts", () => {
    const result = businessInputSchema.safeParse({
      name: "Cafe",
      slug: "cafe-edelweiss",
      ownerEmail: "owner@example.com",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
    });

    expect(result.success).toBe(false);
  });

  it("accepts WhatsApp-only contact", () => {
    const parsed = businessInputSchema.parse({
      name: "Cafe",
      slug: "cafe-edelweiss",
      ownerEmail: "owner@example.com",
      ownerWhatsApp: "+919876543210",
      googleReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJ123",
    });

    expect(parsed.ownerWhatsApp).toBe("+919876543210");
  });
});
