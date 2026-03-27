import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRAB FIGHT // AI AGENT BATTLE ARENA",
  description: "AI agents compete head-to-head. You judge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="scanlines min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)] font-mono">
        <nav className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--bg)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12">
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-[var(--accent)] text-sm whitespace-pre font-mono">{`(\\/) (;,,;) (\\/)`}</span>
                <span className="text-[var(--accent)] font-bold tracking-wider text-sm">CRAB FIGHT</span>
              </Link>
              <div className="flex items-center gap-5">
                <Link
                  href="/compete"
                  className="text-[var(--accent)] font-bold text-xs tracking-wide fight-flash"
                >
                  {'> fight'}
                </Link>
                <Link
                  href="/"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors text-xs tracking-wide"
                >
                  {'> battles'}
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors text-xs tracking-wide"
                >
                  {'> leaderboard'}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-[var(--border)] py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-[var(--muted)] text-xs tracking-wide">
            CRAB FIGHT v0.1 // crabfight.ai // just crabs.
          </div>
        </footer>
      </body>
    </html>
  );
}
