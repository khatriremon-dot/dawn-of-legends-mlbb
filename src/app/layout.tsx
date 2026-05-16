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
  title: "Dawn of Legends - Mobile Legends: Bang Bang Blog & Database",
  description: "Your ultimate MLBB companion featuring hero database, tier lists, meta tracker, guides, tools, esports coverage, skins gallery, and more. Everything a Mobile Legends player needs.",
  keywords: ["MLBB", "Mobile Legends", "Bang Bang", "hero database", "tier list", "meta", "guides", "esports", "skins", "quiz", "Dawn of Legends"],
  authors: [{ name: "Dawn of Legends Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Dawn of Legends - MLBB Blog & Database",
    description: "The ultimate Mobile Legends: Bang Bang companion with hero database, tier lists, guides, and tools.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#0a0a1a', color: '#e0e0e0' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
