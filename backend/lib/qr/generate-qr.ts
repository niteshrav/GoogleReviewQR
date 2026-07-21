import QRCode from "qrcode";

export function buildBusinessReviewUrl(baseUrl: string, slug: string): string {
  return `${baseUrl.replace(/\/$/, "")}/r/${slug}`;
}

export async function generateQrPngBuffer(url: string): Promise<Buffer> {
  const dataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
  });

  const base64 = dataUrl.split(",")[1];
  if (!base64) {
    throw new Error("Failed to generate QR code");
  }

  return Buffer.from(base64, "base64");
}
