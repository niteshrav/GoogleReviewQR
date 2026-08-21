import { describe, expect, it } from "vitest";
import {
  monthlyFeeForPlan,
  planLabel,
  premiumIncludes,
  SETUP_FEE_INR,
} from "@backend/lib/billing/manual-pricing";

describe("manual pricing", () => {
  it("returns Phase 2 list prices", () => {
    expect(SETUP_FEE_INR).toBe(2999);
    expect(monthlyFeeForPlan("pilot")).toBe(0);
    expect(monthlyFeeForPlan("core")).toBe(499);
    expect(monthlyFeeForPlan("premium")).toBe(999);
  });

  it("labels plans for invoices", () => {
    expect(planLabel("premium")).toContain("999");
    expect(premiumIncludes()).toContain("Weekly owner report (WhatsApp + email)");
    expect(premiumIncludes()).toContain("Priority support from Commiters");
  });
});
