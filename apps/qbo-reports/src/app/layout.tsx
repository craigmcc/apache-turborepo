/**
 * Root layout for the QBO Lookup application.
 */

// External Modules ----------------------------------------------------------

import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

// Internal Modules ----------------------------------------------------------

import { MenuBar } from "@/components/layout/MenuBar";

// Public Objects ------------------------------------------------------------

// Attempt to avoid pre-rendering on pages that do Prisma calls -- breaks on GitHub Actions
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QBO Reports",
  description: "Render Customized Reports from QuickBooks Online",
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
      <Toaster
        closeButton
        invert
        position="top-right"
        richColors
      />
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
