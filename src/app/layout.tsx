import type { Metadata } from "next";
import { Barlow_Condensed, Inter, Manrope } from "next/font/google";

import { MotionProvider } from "@/components/motion/motion-provider";
import { MusicProvider } from "@/components/providers/music-provider";
import { productionAssets } from "@/features/dress-up/catalog";

import "./globals.css";

const displayFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const editorialFont = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "White Chorus — Dress, Create, and Share",
    template: "%s — White Chorus",
  },
  description:
    "Dress Emir and Friska, publish your look to the Hall of Fame, and compete for the daily spotlight.",
  applicationName: "White Chorus",
  openGraph: {
    type: "website",
    title: "White Chorus — Dress, Create, and Share",
    description:
      "Dress Emir and Friska, publish your look to the Hall of Fame, and compete for the daily spotlight.",
    images: [
      {
        url: productionAssets.defaultSocialPath,
        width: 1200,
        height: 630,
        alt: "Emir and Friska on the White Chorus dance floor.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [productionAssets.defaultSocialPath],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${editorialFont.variable}`}
      >
        <MotionProvider>
          <MusicProvider>{children}</MusicProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
