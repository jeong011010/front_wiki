import SentryInit from "@/components/SentryInit";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ToastContainer } from "@/components/ui";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "프론트위키 - 프론트엔드 개발 지식 위키",
    template: "%s - 프론트위키",
  },
  description: "프론트엔드와 클라우드 개발에 집중한 지식 공유 위키",
  keywords: ["프론트엔드", "개발", "위키", "지식", "프로그래밍", "웹개발"],
  authors: [{ name: "프론트위키" }],
  creator: "프론트위키",
  publisher: "프론트위키",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    siteName: "프론트위키",
    title: "프론트위키 - 프론트엔드 개발 지식 위키",
    description: "프론트엔드와 클라우드 개발에 집중한 지식 공유 위키",
  },
  twitter: {
    card: "summary_large_image",
    title: "프론트위키 - 프론트엔드 개발 지식 위키",
    description: "프론트엔드와 클라우드 개발에 집중한 지식 공유 위키",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SentryInit />
        {children}
        <ToastContainer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
