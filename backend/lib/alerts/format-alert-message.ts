type OwnerAlertCopyInput = {
  businessName: string;
  rating: number;
  comment?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  timestamp: Date;
};

function sharedFields(input: OwnerAlertCopyInput) {
  return {
    comment: input.comment?.trim() ? input.comment.trim() : "No comment",
    name: input.customerName?.trim() ? input.customerName.trim() : "Not shared",
    phone: input.customerPhone?.trim() ? input.customerPhone.trim() : "Not shared",
  };
}

/** Detailed copy for email archive / admin logs. */
export function formatOwnerAlertMessage(input: OwnerAlertCopyInput): string {
  const fields = sharedFields(input);
  return [
    `TrustTap alert — ${input.businessName}`,
    `Rating: ${input.rating}/5`,
    `Comment: ${fields.comment}`,
    `Customer name: ${fields.name}`,
    `Customer contact: ${fields.phone}`,
    `Time: ${input.timestamp.toISOString()}`,
  ].join("\n");
}

/** Compact WhatsApp template — scannable on a phone. */
export function formatOwnerAlertWhatsApp(input: OwnerAlertCopyInput): string {
  const fields = sharedFields(input);
  return [
    `TrustTap alert — ${input.businessName}`,
    `${input.rating}/5`,
    fields.comment,
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    "Reply to recover this visit.",
  ].join("\n");
}

/** Short SMS fallback — keep under a few concatenated segments. */
export function formatOwnerAlertSms(input: OwnerAlertCopyInput): string {
  const fields = sharedFields(input);
  const snippet =
    fields.comment === "No comment"
      ? "No comment"
      : fields.comment.length > 80
        ? `${fields.comment.slice(0, 77)}...`
        : fields.comment;
  return `TrustTap ${input.businessName}: ${input.rating}/5. ${snippet}. Name ${fields.name}. Phone ${fields.phone}.`;
}
