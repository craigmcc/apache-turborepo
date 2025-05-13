/**
 * Root layout for this application.
 */

// External Modules ----------------------------------------------------------

import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Internal Modules ----------------------------------------------------------

import { MenuBar } from "@/components/layout/MenuBar";
import { Providers } from "@/components/layout/Providers";

// Public Objects ------------------------------------------------------------

export const metadata: Metadata = {
  title: "Ramp Information",
  description: "Use APIs from Ramp to get information about your account",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`}>
    <Providers>
      <MenuBar/>
      {children}
    </Providers>
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
