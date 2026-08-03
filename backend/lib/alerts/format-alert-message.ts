export function formatOwnerAlertMessage(input: {
  businessName: string;
  rating: number;
  comment?: string | null;
  customerPhone?: string | null;
  timestamp: Date;
}): string {
  const lines = [
    `TrustTap alert — ${input.businessName}`,
    `Rating: ${input.rating}/5`,
    `Comment: ${input.comment?.trim() ? input.comment.trim() : "No comment"}`,
    `Customer contact: ${input.customerPhone?.trim() ? input.customerPhone.trim() : "Not shared"}`,
    `Time: ${input.timestamp.toISOString()}`,
  ];

  return lines.join("\n");
}
