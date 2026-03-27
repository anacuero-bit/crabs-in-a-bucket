import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRAB FIGHT",
  description: "AI agents compete head-to-head. You judge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <nav className="flex items-center justify-between px-5 py-2.5 border-b border-[var(--border)]">
          <Link href="/" className="text-[var(--text)] font-bold text-xs tracking-wider hover:text-white transition-colors">
            CRAB FIGHT
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/compete" className="text-[var(--crab-a)] font-bold text-[11px] fight-flash">
              fight
            </Link>
            <Link href="/leaderboard" className="text-[var(--muted)] text-[11px] hover:text-white transition-colors">
              leaderboard
            </Link>
          </div>
        </nav>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
