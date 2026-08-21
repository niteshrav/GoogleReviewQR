export type BillingPlan = string;
export type BillingStatus = "trial" | "invoiced" | "paid" | "overdue";
export type AlertChannel = "whatsapp" | "sms" | "email";

export type CreateBusinessInput = {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerWhatsApp?: string | null;
  ownerSmsPhone?: string | null;
  googleReviewUrl: string;
  plan?: BillingPlan;
  billingStatus?: BillingStatus;
  setupFeePaid?: boolean;
  lastInvoiceSentAt?: Date | null;
  paymentReceivedAt?: Date | null;
  paymentAmountInr?: number | null;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  ownerAccessSecret?: string | null;
  ownerSessionToken?: string | null;
};

export type UpdateBusinessInput = {
  name?: string;
  ownerEmail?: string;
  ownerWhatsApp?: string | null;
  ownerSmsPhone?: string | null;
  googleReviewUrl?: string;
  isActive?: boolean;
  plan?: BillingPlan;
  billingStatus?: BillingStatus;
  setupFeePaid?: boolean;
  lastInvoiceSentAt?: Date | null;
  paymentReceivedAt?: Date | null;
  paymentAmountInr?: number | null;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  ownerAccessSecret?: string | null;
  ownerSessionToken?: string | null;
  lastWeeklyReportAt?: Date | null;
};

export type CreateFeedbackInput = {
  businessId: string;
  rating?: number | null;
  comment?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  clickedGoogle?: boolean;
  locationLabel?: string | null;
  alertChannel?: AlertChannel | null;
};

export type ListFeedbackOptions = {
  businessId: string;
  limit?: number;
};
