import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(root, relativePath), "utf8");
}

const customerUiFiles = [
  "frontend/views/review-page.tsx",
  "frontend/views/feedback-page.tsx",
  "frontend/components/feedback/feedback-form.tsx",
  "frontend/components/feedback/star-rating.tsx",
  "frontend/components/google-review-button.tsx",
];

describe("mobile-first customer UI (pre-deploy)", () => {
  it("sets a mobile viewport in the root layout metadata", () => {
    const layout = read("frontend/app/layout.tsx");
    expect(layout).toMatch(/viewport/);
    expect(layout).toMatch(/device-width|width:\s*["']device-width["']/);
  });

  it("keeps customer pages single-column and phone-width constrained", () => {
    for (const file of ["frontend/views/review-page.tsx", "frontend/views/feedback-page.tsx"]) {
      const contents = read(file);
      expect(contents).toMatch(/max-w-lg/);
      expect(contents).toMatch(/px-5|px-4/);
      expect(contents).not.toMatch(/md:grid-cols-|lg:grid-cols-/);
    }
  });

  it("uses full-width primary CTAs sized for thumb taps", () => {
    const googleButton = read("frontend/components/google-review-button.tsx");
    expect(googleButton).toMatch(/w-full/);
    expect(googleButton).toMatch(/py-3|min-h-\[44px\]|h-11|h-12/);

    const form = read("frontend/components/feedback/feedback-form.tsx");
    expect(form).toMatch(/w-full/);
    expect(form).toMatch(/Submit private feedback/);
  });

  it("sizes star rating targets at least 44px for mobile touch", () => {
    const stars = read("frontend/components/feedback/star-rating.tsx");
    expect(stars).toMatch(/min-h-\[44px\]|h-11|h-12|min-w-\[44px\]|w-11|w-12/);
  });

  it("uses 16px+ text on mobile form controls to avoid iOS zoom", () => {
    const form = read("frontend/components/feedback/feedback-form.tsx");
    expect(form).toMatch(/text-base/);
  });

  it("includes mobile-first base styles for touch and overflow", () => {
    const css = read("frontend/styles/globals.css");
    expect(css).toMatch(/touch-action:\s*manipulation/);
    expect(css).toMatch(/-webkit-tap-highlight-color/);
    expect(css).toMatch(/overflow-x:\s*hidden|overflow-x:\s*clip/);
  });

  it("customer UI files avoid desktop-only interaction patterns", () => {
    for (const file of customerUiFiles) {
      const contents = read(file);
      expect(contents).not.toMatch(/onMouseEnter|onMouseOver/);
      expect(contents).not.toMatch(/hover-only|desktop-only/i);
    }
  });
});
