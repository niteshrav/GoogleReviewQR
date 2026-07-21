import nodemailer from "nodemailer";
import { getEnv } from "@backend/lib/env";

export type AlertEmailPayload = {
  to: string;
  businessName: string;
  rating: number;
  comment?: string | null;
  timestamp: Date;
  whatsAppLink?: string | null;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const env = getEnv();

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendLowRatingAlert(payload: AlertEmailPayload): Promise<void> {
  const env = getEnv();
  const transport = getTransporter();

  const subject = `Low feedback — ${payload.businessName} — ${payload.rating}/5`;
  const lines = [
    "New private feedback received",
    "",
    `Business: ${payload.businessName}`,
    `Rating: ${payload.rating}/5`,
    `Comment: ${payload.comment?.trim() ? payload.comment.trim() : "No comment"}`,
    `Time: ${payload.timestamp.toISOString()}`,
  ];

  if (payload.whatsAppLink) {
    lines.push("", `WhatsApp: ${payload.whatsAppLink}`);
  }

  lines.push("", "---", "Powered by Commiters FeedbackFlow");

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: payload.to,
    subject,
    text: lines.join("\n"),
  });
}

export function buildWhatsAppLink(
  ownerWhatsApp: string,
  businessName: string,
  rating: number,
  comment?: string | null,
): string {
  const digits = ownerWhatsApp.replace(/\D/g, "");
  const text = [
    `FeedbackFlow alert — ${businessName}`,
    `Rating: ${rating}/5`,
    comment?.trim() ? `Comment: ${comment.trim()}` : "Comment: No comment",
  ].join("\n");

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
