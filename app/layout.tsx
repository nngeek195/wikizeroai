import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. DEFAULT METADATA (For the whole app)
export const metadata: Metadata = {
  title: {
    default: "WikiZero AI - Create Your Digital Twin",
    template: "%s | WikiZero AI", // e.g. "Chat with Niranga | WikiZero AI"
  },
  description: "Build a custom AI assistant trained on your skills, bio, and personality. Share it with recruiters, clients, or friends.",
  keywords: ["AI", "Digital Twin", "Chatbot Builder", "Personal AI", "Portfolio AI"],
  verification: {
    google: "Krn0xX92X-iQhPM6D",
  },
  openGraph: {
    title: "WikiZero AI - Create Your Digital Twin",
    description: "Build a custom AI assistant trained on your skills and bio.",
    url: "https://wikizeroai.vercel.app", // REPLACE with your actual domain
    siteName: "WikiZero AI",
    images: [
      {
        url: "/og-platform.png", // Make a cool 1200x630 image for your landing page
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}