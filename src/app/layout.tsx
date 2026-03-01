import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { ConditionalContent } from "./ConditionalContent";
import { ToastProvider } from "@/lib/toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlaySync — Gaming Synchronization Platform",
  description: "The premium gaming dashboard for tracking your performance, rankings, and squad activities.",
  keywords: ["gaming", "esports", "leaderboard", "performance tracking"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased flex min-h-screen flex-col bg-white text-gray-900`}
        suppressHydrationWarning
      >
        <ToastProvider />
        <Providers>
          <ConditionalContent>
            {children}
          </ConditionalContent>
        </Providers>
      </body>
    </html>
  );
}
