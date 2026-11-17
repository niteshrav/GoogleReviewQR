import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@frontend/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Prooflyn",
  description:
    "QR-powered customer feedback that helps local businesses improve service and make Google reviews easy.",
  metadataBase: new URL(process.env.BASE_URL ?? "http://localhost:3000"),
  applicationName: "Prooflyn",
};

/** Mobile-first: QR scans open on phones — lock layout to device width. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0A2E50",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
