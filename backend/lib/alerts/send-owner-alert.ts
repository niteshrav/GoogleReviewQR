import { formatOwnerAlertMessage } from "@backend/lib/alerts/format-alert-message";
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
};

export async function sendOwnerAlert(input: OwnerAlertInput): Promise<OwnerAlertResult> {
  const message = formatOwnerAlertMessage({
    businessName: input.businessName,
    rating: input.rating,
    comment: input.comment,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    timestamp: input.timestamp,
  });

  let phoneDelivered = false;
  try {
    phoneDelivered = await sendPhoneAlert({
      ownerWhatsApp: input.ownerWhatsApp,
      ownerSmsPhone: input.ownerSmsPhone,
      message,
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

  return { phoneDelivered, emailDelivered };
}
