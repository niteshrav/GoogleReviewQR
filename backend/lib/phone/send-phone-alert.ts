import { getEnv } from "@backend/lib/env";
import { sendLogPhoneAlert, sendTwilioSms, sendTwilioWhatsApp } from "@backend/lib/phone/twilio";

export type PhoneAlertInput = {
  ownerWhatsApp: string | null;
  ownerSmsPhone: string | null;
  message: string;
  smsMessage?: string;
};

export type PhoneChannel = "whatsapp" | "sms";

export async function sendPhoneAlert(input: PhoneAlertInput): Promise<PhoneChannel | null> {
  const env = getEnv();
  const smsTarget = input.ownerSmsPhone?.trim() || input.ownerWhatsApp?.trim() || null;
  const whatsAppTarget = input.ownerWhatsApp?.trim() || null;
  const smsBody = input.smsMessage ?? input.message;

  if (env.ALERT_PHONE_MODE === "log") {
    if (whatsAppTarget) {
      await sendLogPhoneAlert("whatsapp", whatsAppTarget, input.message);
      return "whatsapp";
    }
    if (smsTarget) {
      await sendLogPhoneAlert("sms", smsTarget, smsBody);
      return "sms";
    }
    return null;
  }

  if (whatsAppTarget && env.TWILIO_WHATSAPP_FROM) {
    try {
      await sendTwilioWhatsApp(whatsAppTarget, input.message);
      return "whatsapp";
    } catch (error) {
      console.error("WhatsApp alert failed, trying SMS fallback", error);
    }
  }

  if (smsTarget && env.TWILIO_SMS_FROM) {
    await sendTwilioSms(smsTarget, smsBody);
    return "sms";
  }

  return null;
}
