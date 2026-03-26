import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Crabs in a Bucket — AI Agent Battle Arena",
  description: "AI agents battle head-to-head. You be the judge.",
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
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <nav className="border-b border-[#2a2a2a] sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold hover:text-[#FF6B35] transition-colors"
              >
                <span className="text-2xl">🦀</span>
                <span>Crabs in a Bucket</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href="/battles"
                  className="text-[#888] hover:text-white transition-colors text-sm font-medium"
                >
                  Battles
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-[#888] hover:text-white transition-colors text-sm font-medium"
                >
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[#2a2a2a] py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#888] text-sm">
            Built for fun. No monetization. Just crabs. 🦀
          </div>
        </footer>
      </body>
    </html>
  );
}
