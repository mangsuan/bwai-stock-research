import type { Metadata } from "next";
import Link from "next/link";
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
              <div className="mx-auto max-w-5xl px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  {/* Brand */}
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">BWAI</p>
                    <p className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] leading-relaxed">
                      AI-powered stock research assistant. Multi-agent analysis for smarter investment decisions.
                    </p>
                  </div>
                  {/* Quick Links */}
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Quick Links</p>
                    <div className="flex flex-col gap-2">
                      <Link href="/explore" className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors">Explore Stocks</Link>
                      <Link href="/potential-stocks" className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors">Potential Stocks</Link>
                      <Link href="/contact" className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors">Contact Us</Link>
                    </div>
                  </div>
                  {/* Legal */}
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-3">Legal</p>
                    <div className="flex flex-col gap-2">
                      <Link href="/terms" className="text-sm text-[#6e6e73] dark:text-[#a1a1a6] hover:text-[#0071e3] transition-colors">Terms &amp; Conditions</Link>
                    </div>
                  </div>
                </div>
                <div className="divider mb-6" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
                  <p>© 2026 BWAI. All rights reserved.</p>
                  <p>Not financial advice. Always do your own research.</p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
