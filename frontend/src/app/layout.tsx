import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BWAI — Stock Research",
  description: "AI-powered stock research assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#1d1d1f] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-[#d2d2d7] dark:border-[#38383a] bg-[#fbfbfd] dark:bg-[#2d2d2f]">
              <div className="mx-auto max-w-5xl px-6 py-8">
                <div className="flex flex-col items-center gap-4 text-sm text-[#6e6e73] dark:text-[#a1a1a6]">
                  <p className="font-medium">BWAI — Buy With AI</p>
                  <p>Not financial advice. Always do your own research.</p>
                  <p className="text-xs text-[#86868b]">© 2026 BWAI. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
