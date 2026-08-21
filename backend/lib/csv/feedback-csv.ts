type FeedbackRow = {
  createdAt: Date | string;
  rating: number | null;
  comment: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  clickedGoogle: boolean;
  alertSentAt?: Date | string | null;
  alertChannel?: string | null;
};

function csvCell(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function feedbackToCsv(rows: FeedbackRow[]): string {
  const header = [
    "createdAt",
    "rating",
    "comment",
    "customerName",
    "customerPhone",
    "clickedGoogle",
    "alertSentAt",
    "alertChannel",
  ].join(",");

  const lines = rows.map((row) =>
    [
      csvCell(new Date(row.createdAt).toISOString()),
      csvCell(row.rating),
      csvCell(row.comment),
      csvCell(row.customerName),
      csvCell(row.customerPhone),
      csvCell(row.clickedGoogle ? "yes" : "no"),
      csvCell(row.alertSentAt ? new Date(row.alertSentAt).toISOString() : ""),
      csvCell(row.alertChannel),
    ].join(","),
  );

  return [header, ...lines].join("\n");
}
