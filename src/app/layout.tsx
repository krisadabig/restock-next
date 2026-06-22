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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:rounded focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Skip to content
        </a>
        <NextTopLoader color="#7f13ec" showSpinner={false} />
        <Providers>
          <PWARegistry />
          <main id="main-content" className="min-h-screen">
              {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
