import type { Metadata } from "next";
import { Oswald, Zen_Kaku_Gothic_New } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku-gothic-new",
  weight: ["400", "500", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gran☆Ciel Setlists",
  description: "Gran☆Ciel セットリストアーカイブ",
};

const navLinks = [
  { href: "/", label: "今月の公演" },
  { href: "/events", label: "イベント" },
  { href: "/calendar", label: "カレンダー" },
  { href: "/music", label: "楽曲" },
  { href: "/venues", label: "会場別" },
  { href: "/import", label: "インポート" },
  { href: "/about", label: "About" },
]

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${oswald.variable} ${zenKakuGothicNew.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b bg-background sticky top-0 z-40">
          <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-1 overflow-x-auto">
            <Link
              href="/"
              className="font-display font-semibold tracking-wide text-lg mr-4 shrink-0"
            >
              Gran<span className="text-brand">☆</span>Ciel
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
