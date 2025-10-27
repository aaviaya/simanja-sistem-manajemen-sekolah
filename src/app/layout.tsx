import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMANJA - Sistem Manajemen Sekolah",
  description: "Platform manajemen sekolah berbasis web untuk mempermudah pengelolaan administrasi dan komunikasi di lingkungan sekolah.",
  keywords: ["SIMANJA", "Sistem Manajemen Sekolah", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Pengaduan", "Surat Menyurat", "Arsip Dokumen"],
  authors: [{ name: "SIMANJA Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "SIMANJA - Sistem Manajemen Sekolah",
    description: "Platform manajemen sekolah untuk pengelolaan administrasi dan komunikasi",
    url: "http://localhost:3000",
    siteName: "SIMANJA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIMANJA - Sistem Manajemen Sekolah",
    description: "Platform manajemen sekolah untuk pengelolaan administrasi dan komunikasi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
