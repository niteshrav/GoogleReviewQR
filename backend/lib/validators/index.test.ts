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

  it("accepts Google Maps place links and short maps.app links", () => {
    expect(
      googleReviewUrlSchema.parse("https://www.google.com/maps/place/Cafe+Edelweiss"),
    ).toContain("google.com/maps");
    expect(googleReviewUrlSchema.parse("https://maps.app.goo.gl/abc123")).toBe(
      "https://maps.app.goo.gl/abc123",
    );
    expect(googleReviewUrlSchema.parse("maps.app.goo.gl/abc123")).toBe(
      "https://maps.app.goo.gl/abc123",
    );
  });

  it("rejects non-Google URLs with a clear message", () => {
    const result = googleReviewUrlSchema.safeParse("https://example.com/review");
    expect(result.success).toBe(false);
  });

  it("rejects plain text that is not a URL", () => {
    const result = googleReviewUrlSchema.safeParse("my cafe google page");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/https:\/\//i);
    }
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

  it("accepts optional customer phone", () => {
    const parsed = feedbackInputSchema.parse({
      businessSlug: "cafe-edelweiss",
      rating: 2,
      customerPhone: "+919876543210",
    });

    expect(parsed.customerPhone).toBe("+919876543210");
  });

  it("allows empty customer phone", () => {
    const parsed = feedbackInputSchema.parse({
      businessSlug: "cafe-edelweiss",
      rating: 3,
      customerPhone: "",
    });

    expect(parsed.customerPhone).toBe("");
  });

  it("accepts optional customer name", () => {
    const parsed = feedbackInputSchema.parse({
      businessSlug: "cafe-edelweiss",
      rating: 4,
      customerName: "Priya",
    });

    expect(parsed.customerName).toBe("Priya");
  });

  it("allows empty customer name", () => {
    const parsed = feedbackInputSchema.parse({
      businessSlug: "cafe-edelweiss",
      rating: 4,
      customerName: "",
    });

    expect(parsed.customerName).toBe("");
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
