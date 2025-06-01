/**
 * Root layout for the Ramp Lookup application.
 */

// External Modules ----------------------------------------------------------

import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Internal Modules ----------------------------------------------------------

import { MenuBar } from "@/components/layout/MenuBar";

// Public Objects ------------------------------------------------------------

// Attenpt to avoid prerendering on pages that do Prisma calls -- breaks on GitHub Actions
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ramp Download",
  description: "Download Ramp API data and store it in a local database",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <MenuBar />
      {children}
    </body>
    </html>
  );
}


// Private Objects -----------------------------------------------------------

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
