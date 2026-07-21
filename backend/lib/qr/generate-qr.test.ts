import { describe, expect, it } from "vitest";
import { buildBusinessReviewUrl, generateQrPngBuffer } from "@backend/lib/qr/generate-qr";

describe("generateQrPng", () => {
  it("builds the public business review URL", () => {
    const url = buildBusinessReviewUrl("https://feedbackflow.commiters.in", "cafe-edelweiss");
    expect(url).toBe("https://feedbackflow.commiters.in/r/cafe-edelweiss");
  });

  it("returns a PNG buffer for a valid URL", async () => {
    const buffer = await generateQrPngBuffer("https://feedbackflow.commiters.in/r/cafe-edelweiss");

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
  });
});
