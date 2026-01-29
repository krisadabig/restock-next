import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
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

import NextTopLoader from 'nextjs-toploader';

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased font-sans bg-slate-950`}
      >
        <NextTopLoader color="#6366f1" showSpinner={false} />
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
