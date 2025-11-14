import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/home/header";
import ReactQueryClientProvider from "@/components/provider/query-client-provider";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "We Hire - Hiring Management Platform",
  description: "A platform for managing hiring processes",
};

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
        <ReactQueryClientProvider>
          <Suspense>
            <Header />
          </Suspense>
          {children}
          <Toaster richColors position="bottom-right" />
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
