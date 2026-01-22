import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restock | Premium Home Tracking",
  description: "Track your home supplies with ease and style.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Providers } from "@/components/Providers";
import { PWARegistry } from "@/components/PWARegistry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PWARegistry />
          <main className="min-h-screen">
              {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
