/**
 * Root layout for the Bootstrap Alone application.
 */

// External Modules ----------------------------------------------------------

import "bootstrap/dist/css/bootstrap.min.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

// Internal Modules ----------------------------------------------------------

import { MenuBar } from "@/components/layout/MenuBar";
//import { Providers } from "@/components/layout/Providers";

// Public Objects ------------------------------------------------------------

// Attenpt to avoid prerendering on pages that do Prisma calls -- breaks on GitHub Actions
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bootstrap Alone",
  description: "Demonstration of Bootstrap components",
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning={true} >
    {/*<Providers>*/}
      <MenuBar />
      {children}
    {/*</Providers>*/}
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
