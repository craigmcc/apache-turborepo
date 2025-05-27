/**
 * Root layout for the Ramp Lookup application.
 */

// External Modules ----------------------------------------------------------

import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Internal Modules ----------------------------------------------------------

// Public Objects ------------------------------------------------------------

  export const metadata: Metadata = {
    title: "Ramp Lookup",
    description: "Look up recently refreshed Ramp data",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
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
