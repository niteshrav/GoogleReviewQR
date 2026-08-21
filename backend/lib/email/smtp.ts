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

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) {
    return transporter;
  }

  const env = getEnv();

  if (env.ALERT_EMAIL_MODE === "log") {
    // Safe local/demo mode: capture email payload in logs only.
    transporter = nodemailer.createTransport({ jsonTransport: true });
    console.log("[smtp] Email log mode enabled (ALERT_EMAIL_MODE=log).");
  } else {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return transporter;
}

async function send(options: nodemailer.SendMailOptions): Promise<void> {
  const env = getEnv();
  const transport = await getTransporter();
  const info = await transport.sendMail({ from: env.SMTP_FROM, ...options });

  if (env.ALERT_EMAIL_MODE === "log" && info.message) {
    try {
      const parsed = JSON.parse(info.message as string);
      console.log(`[smtp] EMAIL to=${parsed.to?.[0]?.address ?? options.to}`);
      console.log(`[smtp]   Subject: ${parsed.subject}`);
      console.log(`[smtp]   Body preview: ${(parsed.text as string)?.slice(0, 120)}...`);
    } catch {
      // ignore parse errors
    }
  }
}

export async function sendLowRatingAlert(payload: AlertEmailPayload): Promise<void> {
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

  await send({ to: payload.to, subject, text: lines.join("\n") });
}

export async function sendWeeklyReportEmail(payload: {
  to: string;
  businessName: string;
  body: string;
}): Promise<void> {
  await send({
    to: payload.to,
    subject: `TrustTap weekly report — ${payload.businessName}`,
    text: payload.body,
  });
}
