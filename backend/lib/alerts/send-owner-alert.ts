import {
  formatOwnerAlertSms,
  formatOwnerAlertWhatsApp,
} from "@backend/lib/alerts/format-alert-message";
import { sendLowRatingAlert } from "@backend/lib/email/smtp";
import { sendPhoneAlert } from "@backend/lib/phone/send-phone-alert";

export type OwnerAlertInput = {
  ownerEmail: string;
  ownerWhatsApp: string | null;
  ownerSmsPhone: string | null;
  businessName: string;
  rating: number;
  comment?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  timestamp: Date;
};

export type OwnerAlertResult = {
  phoneDelivered: boolean;
  emailDelivered: boolean;
  alertChannel: "whatsapp" | "sms" | "email" | null;
};

export async function sendOwnerAlert(input: OwnerAlertInput): Promise<OwnerAlertResult> {
  const copyInput = {
    businessName: input.businessName,
    rating: input.rating,
    comment: input.comment,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    timestamp: input.timestamp,
  };

  let phoneChannel: "whatsapp" | "sms" | null = null;
  try {
    phoneChannel = await sendPhoneAlert({
      ownerWhatsApp: input.ownerWhatsApp,
      ownerSmsPhone: input.ownerSmsPhone,
      message: formatOwnerAlertWhatsApp(copyInput),
      smsMessage: formatOwnerAlertSms(copyInput),
    });
  } catch (error) {
    console.error("Primary phone alert failed", error);
  }

  let emailDelivered = false;
  try {
    await sendLowRatingAlert({
      to: input.ownerEmail,
      businessName: input.businessName,
      rating: input.rating,
      comment: input.comment,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      timestamp: input.timestamp,
    });
    emailDelivered = true;
  } catch (error) {
    console.error("Email backup alert failed", error);
  }

  return {
    phoneDelivered: Boolean(phoneChannel),
    emailDelivered,
    alertChannel: phoneChannel ?? (emailDelivered ? "email" : null),
  };
}
