import { describe, expect, it } from "vitest";
import {
  monthlyFeeForPlan,
  planLabel,
  premiumIncludes,
  SETUP_FEE_INR,
} from "@backend/lib/billing/manual-pricing";

describe("manual pricing", () => {
  it("returns current list prices with free setup", () => {
    expect(SETUP_FEE_INR).toBe(0);
    expect(monthlyFeeForPlan("pilot")).toBe(0);
    expect(monthlyFeeForPlan("core")).toBe(299);
    expect(monthlyFeeForPlan("premium")).toBe(699);
  });

  it("labels plans for invoices", () => {
    expect(planLabel("premium")).toContain("699");
    expect(premiumIncludes()).toContain("Weekly owner report (WhatsApp + email)");
    expect(premiumIncludes()).toContain("Priority support from Commiters");
  });
});
