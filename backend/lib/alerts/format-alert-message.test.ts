import { describe, expect, it } from "vitest";
import {
  formatOwnerAlertMessage,
  formatOwnerAlertSms,
  formatOwnerAlertWhatsApp,
} from "@backend/lib/alerts/format-alert-message";

const input = {
  businessName: "Cafe Edelweiss",
  rating: 2,
  comment: "Slow service at lunch",
  customerName: "Asha",
  customerPhone: "+919876543210",
  timestamp: new Date("2026-08-14T10:00:00.000Z"),
};

describe("owner alert templates", () => {
  it("keeps a detailed email/archive template", () => {
    const message = formatOwnerAlertMessage(input);
    expect(message).toContain("TrustTap alert — Cafe Edelweiss");
    expect(message).toContain("Rating: 2/5");
    expect(message).toContain("Customer name: Asha");
    expect(message).toContain("2026-08-14T10:00:00.000Z");
  });

  it("formats a compact WhatsApp template", () => {
    const message = formatOwnerAlertWhatsApp(input);
    expect(message).toContain("2/5");
    expect(message).toContain("Slow service at lunch");
    expect(message).toContain("Reply to recover this visit.");
    expect(message).not.toContain("Rating:");
  });

  it("formats a short SMS fallback and truncates long comments", () => {
    const message = formatOwnerAlertSms({
      ...input,
      comment: "A".repeat(120),
    });
    expect(message.startsWith("TrustTap Cafe Edelweiss: 2/5.")).toBe(true);
    expect(message).toContain("...");
    expect(message.length).toBeLessThan(280);
  });
});
