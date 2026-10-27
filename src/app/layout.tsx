import type { Metadata } from "next";
import { Oswald, Zen_Kaku_Gothic_New } from "next/font/google";
import Link from "next/link";
import { HamburgerMenu } from "@/components/HamburgerMenu";
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

const SITE_DESCRIPTION = "Gran☆Ciel セットリストアーカイブ";

export const metadata: Metadata = {
  // Required for OGP/Twitter image and URL tags to resolve to absolute
  // URLs (crawlers won't fetch a relative og:image path).
  metadataBase: new URL("https://ciel-live.vercel.app"),
  title: "Gran☆Ciel Data",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Gran☆Ciel Data",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Gran☆Ciel Data",
    description: SITE_DESCRIPTION,
  },
};

const navLinks = [
  { href: "/calendar", label: "カレンダー" },
  { href: "/music", label: "楽曲" },
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
            <div className="ml-auto">
              <HamburgerMenu />
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
