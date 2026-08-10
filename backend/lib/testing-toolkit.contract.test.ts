import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Toolkit contract tests — guardrails for the TDD harness itself.
 * Red if Playwright/CI/scripts drift out of the repo.
 */
describe("testing toolkit contract @tdd", () => {
  it("exposes unit and e2e npm scripts", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      scripts: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(pkg.scripts["test:unit"]).toContain("vitest");
    expect(pkg.scripts["test:e2e"]).toContain("playwright");
    expect(pkg.scripts["test:all"]).toContain("test:unit");
    expect(pkg.scripts["test:ci"]).toContain("test:e2e");
    expect(pkg.devDependencies?.["@playwright/test"]).toBeTruthy();
  });

  it("ships Playwright config, E2E specs, CI workflow, quality gate, and TESTING.md", () => {
    const required = [
      "playwright.config.ts",
      "e2e/smoke.spec.ts",
      "e2e/customer-review-flow.spec.ts",
      "e2e/admin-login.spec.ts",
      "e2e/admin-businesses.spec.ts",
      "e2e/compliance-ungated-google.spec.ts",
      ".github/workflows/test.yml",
      "docs/TESTING.md",
      "docs/QUALITY_GATE.md",
      ".cursor/rules/trusttap-quality-gate.mdc",
      ".cursor/hooks.json",
      ".githooks/pre-push",
      "scripts/setup-git-hooks.sh",
      "scripts/enable-branch-protection.sh",
    ];

    for (const file of required) {
      expect(existsSync(join(process.cwd(), file)), `missing ${file}`).toBe(true);
    }
  });

  it("Playwright targets a mobile device project for QR journeys", () => {
    const config = readFileSync(join(process.cwd(), "playwright.config.ts"), "utf8");
    expect(config).toContain("Pixel 7");
    expect(config).toContain("./e2e");
  });
});
