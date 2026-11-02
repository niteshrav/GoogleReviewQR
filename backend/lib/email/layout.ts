export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderProoflynEmail(options: {
  eyebrow: string;
  title: string;
  intro?: string;
  bodyHtml: string;
}): string {
  const intro = options.intro
    ? `<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#506070;">${options.intro}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f7fb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e3eef8;border-radius:16px;">
            <tr>
              <td style="background:#0a2e50;padding:28px 32px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">Prooflyn</p>
                <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#9fd0f2;">Prove. Improve. Grow.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1e88e5;">${options.eyebrow}</p>
                <h1 style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.3;font-weight:700;color:#0a2e50;">${options.title}</h1>
                ${intro}
                ${options.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 22px;background:#f7fafc;border-top:1px solid #e6eef6;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#506070;">Powered by Commiters Prooflyn</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderEmailRows(
  rows: Array<{ label: string; value: string }>,
): string {
  const items = rows
    .map(
      (row, index) => `<tr>
        <td style="padding:14px 0;border-top:${index === 0 ? "0" : "1px solid #e6eef6"};font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#506070;">${escapeHtml(row.label)}</td>
        <td align="right" style="padding:14px 0;border-top:${index === 0 ? "0" : "1px solid #e6eef6"};font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#0a2e50;">${escapeHtml(row.value)}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">${items}</table>`;
}

export function renderEmailNote(text: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr>
      <td style="padding:16px 18px;background:#e3f2fd;border-radius:12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#0a2e50;">${text}</td>
    </tr>
  </table>`;
}
