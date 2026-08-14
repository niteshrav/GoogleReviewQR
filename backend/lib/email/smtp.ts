import nodemailer from "nodemailer";
import { getEnv } from "@backend/lib/env";

export type AlertEmailPayload = {
  to: string;
  businessName: string;
  rating: number;
  comment?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  timestamp: Date;
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
    "New private feedback received (email backup)",
    "",
    `Business: ${payload.businessName}`,
    `Rating: ${payload.rating}/5`,
    `Comment: ${payload.comment?.trim() ? payload.comment.trim() : "No comment"}`,
    `Customer name: ${payload.customerName?.trim() ? payload.customerName.trim() : "Not shared"}`,
    `Customer contact: ${payload.customerPhone?.trim() ? payload.customerPhone.trim() : "Not shared"}`,
    `Time: ${payload.timestamp.toISOString()}`,
    "",
    "Primary alert channel: automated WhatsApp or SMS to the owner phone.",
    "",
    "---",
    "Powered by Commiters TrustTap",
  ];

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: payload.to,
    subject,
    text: lines.join("\n"),
  });
}
