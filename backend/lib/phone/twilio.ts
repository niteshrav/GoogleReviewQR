import { getEnv } from "@backend/lib/env";

type TwilioMessageResult = {
  sid: string;
};

function getTwilioAuthHeader(): string | null {
  const env = getEnv();
  if (env.ALERT_PHONE_MODE !== "twilio" || !env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  const token = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString(
    "base64",
  );
  return `Basic ${token}`;
}

function normalizeE164(phone: string): string {
  const trimmed = phone.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;
}

async function postTwilioMessage(body: URLSearchParams): Promise<TwilioMessageResult> {
  const env = getEnv();
  const auth = getTwilioAuthHeader();
  if (!auth || !env.TWILIO_ACCOUNT_SID) {
    throw new Error("Twilio is not configured");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Twilio send failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { sid?: string };
  if (!data.sid) {
    throw new Error("Twilio response missing message sid");
  }

  return { sid: data.sid };
}

export async function sendTwilioSms(to: string, message: string): Promise<TwilioMessageResult> {
  const env = getEnv();
  if (!env.TWILIO_SMS_FROM) {
    throw new Error("TWILIO_SMS_FROM is not configured");
  }

  const body = new URLSearchParams({
    To: normalizeE164(to),
    From: env.TWILIO_SMS_FROM,
    Body: message,
  });

  return postTwilioMessage(body);
}

export async function sendTwilioWhatsApp(to: string, message: string): Promise<TwilioMessageResult> {
  const env = getEnv();
  if (!env.TWILIO_WHATSAPP_FROM) {
    throw new Error("TWILIO_WHATSAPP_FROM is not configured");
  }

  const destination = normalizeE164(to).replace(/^\+/, "");
  const body = new URLSearchParams({
    To: `whatsapp:+${destination}`,
    From: env.TWILIO_WHATSAPP_FROM,
    Body: message,
  });

  return postTwilioMessage(body);
}

export async function sendLogPhoneAlert(channel: "whatsapp" | "sms", to: string, message: string) {
  console.info(`[trusttap-phone:${channel}] to=${to}\n${message}`);
  return { sid: `log-${Date.now()}` };
}
