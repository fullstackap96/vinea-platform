import type { Metadata } from "next";
import {
  SITE_DOCUMENT_DESCRIPTION,
  SITE_DOCUMENT_TITLE,
  SITE_OG_IMAGE_ALT,
  SITE_OG_IMAGE_PATH,
} from "@/lib/productBranding";
import { parseExactAppOrigin } from "@/lib/exactAppOrigin";
import "./globals.css";

const metadataBase = parseExactAppOrigin(process.env.NEXT_PUBLIC_APP_URL, {
  requireHttps: process.env.VERCEL === "1",
});

export const metadata: Metadata = {
  metadataBase: metadataBase ?? undefined,
  title: SITE_DOCUMENT_TITLE,
  description: SITE_DOCUMENT_DESCRIPTION,
  openGraph: {
    title: SITE_DOCUMENT_TITLE,
    description: SITE_DOCUMENT_DESCRIPTION,
    type: "website",
    images: [
      {
        url: SITE_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: SITE_OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_DOCUMENT_TITLE,
    description: SITE_DOCUMENT_DESCRIPTION,
    images: [SITE_OG_IMAGE_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
