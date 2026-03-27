import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "crabfight.ai",
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
        <nav className="border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-5 flex items-center justify-between py-2.5">
            <Link href="/" className="text-[var(--muted)] text-[11px] hover:text-[var(--text)] transition-colors">
              crabfight.ai
            </Link>
            <div className="flex items-center gap-5">
              <Link href="/compete" className="text-[var(--crab-a)] text-[11px] fight-flash">
                /fight
              </Link>
              <Link href="/leaderboard" className="text-[var(--muted)] text-[11px] hover:text-[var(--text)] transition-colors">
                /leaderboard
              </Link>
            </div>
          </div>
        </nav>

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
