import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import BottomAdBar from "@/components/ads/BottomAdBar";
import AdSenseScript from "@/components/ads/AdSenseScript";
import ConsentBanner from "@/components/ConsentBanner";
import SiteFooter from "@/components/SiteFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mieuxqueleloto.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mieux que le Loto ? — Tes vraies chances de devenir millionnaire",
  description:
    "Tape une activité, on calcule tes chances de devenir millionnaire et on les compare au Loto (1 chance sur 19 068 840). Spoiler : tout est mieux que le Loto.",
  keywords: [
    "loto",
    "millionnaire",
    "probabilité",
    "devenir riche",
    "comparaison loto",
    "chances",
  ],
  openGraph: {
    title: "Mieux que le Loto ?",
    description:
      "Tes vraies chances de devenir millionnaire, comparées au Loto. Teste ton idée.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mieux que le Loto ?",
    description:
      "Tes vraies chances de devenir millionnaire, comparées au Loto.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5fb1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <AdSenseScript />
        <div className="flex flex-1 flex-col">
          {children}
          <SiteFooter />
        </div>
        <BottomAdBar />
        <ConsentBanner />
        <Analytics />
      </body>
    </html>
  );
}
