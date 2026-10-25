"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/music", label: "発表順" },
  { href: "/music/lyricists", label: "作詞別" },
  { href: "/music/composers", label: "作曲別" },
  { href: "/music/arrangers", label: "編曲別" },
  { href: "/music/choreographers", label: "振付別" },
] as const

export function MusicTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const active = tab.href === "/music" ? pathname === "/music" : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
