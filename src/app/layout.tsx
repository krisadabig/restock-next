import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Restock | Premium Home Tracking",
  description: "Track your home supplies with ease and style.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#7f13ec",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} antialiased font-sans bg-background text-foreground`}
      >
        <NextTopLoader color="#7f13ec" showSpinner={false} />
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
