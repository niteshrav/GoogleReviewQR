import { describe, expect, it } from "vitest";
import { parseDotEnvContents } from "@backend/lib/load-root-env";

describe("parseDotEnvContents", () => {
  it("parses quoted values and skips comments", () => {
    const parsed = parseDotEnvContents(`
# comment
BASE_URL=http://localhost:3000
SMTP_FROM="TrustTap <noreply@commiters.in>"
SMTP_PASS=
`);

    expect(parsed.BASE_URL).toBe("http://localhost:3000");
    expect(parsed.SMTP_FROM).toBe("TrustTap <noreply@commiters.in>");
    expect(parsed.SMTP_PASS).toBe("");
  });
});
