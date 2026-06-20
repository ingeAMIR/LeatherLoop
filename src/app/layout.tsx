import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeatherLoop — Apartado de lotes de merma",
  description:
    "Aparta lotes de merma de cuero en León y recibe la confirmación de que es tuyo. Economía circular del sector cuero-calzado (ODS 12).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2e7d32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={geistSans.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
