"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const MENU_LINKS = [
  { href: "/events", label: "イベント" },
  { href: "/venues", label: "会場別" },
  { href: "/about", label: "About" },
]

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="メニュー"
      >
        <Menu className="size-5" />
      </PopoverTrigger>
      <PopoverContent>
        <nav className="flex flex-col">
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </PopoverContent>
    </Popover>
  )
}
