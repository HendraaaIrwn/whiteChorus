import type { Metadata } from "next";

import { MusicProvider } from "@/components/providers/music-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: {
    default: "White Chorus — Dress, Create, and Share",
    template: "%s — White Chorus",
  },
  description:
    "Dress Emir and Friska, publish your look to the Hall of Fame, and compete for the weekly spotlight.",
  applicationName: "White Chorus",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
