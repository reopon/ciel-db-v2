"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

// Hardcoded, not a DB table — this is a small experimental "meet the
// members" banner for the top page, not an archival data type like
// songs/events. photoUrl points at a local file under public/members/
// (official promo photos, supplied by the group's own site) — null
// until a photo is supplied, when a placeholder (colored initial) is
// rendered instead.
const MEMBERS: { name: string; handle: string; photoUrl: string | null }[] = [
  { name: "上丘鈴華", handle: "rinka_granciel", photoUrl: "/members/rinka.jpg" },
  { name: "小林夢叶", handle: "yumeka_granciel", photoUrl: "/members/yumeka.jpg" },
  { name: "櫻かのん", handle: "kanon_granciel", photoUrl: "/members/kanon.jpg" },
  { name: "花奏さくら", handle: "sakura_granciel", photoUrl: "/members/sakura.jpg" },
  { name: "氷ノ黎", handle: "rei_granciel", photoUrl: "/members/rei.jpg" },
  { name: "源かんな", handle: "kanna_granciel", photoUrl: "/members/kanna.jpg" },
  { name: "徳富りん", handle: "rin__granciel", photoUrl: "/members/rin.jpg" },
]

const INTERVAL_MS = 4000

// Deterministic placeholder colors (brand-ish blue family) so the
// placeholder phase doesn't look randomly flickering between reloads.
const PLACEHOLDER_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#1e40af", "#1e3a8a", "#2563eb", "#1d4ed8"]

export function MemberCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MEMBERS.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const member = MEMBERS[index]

  return (
    <a
      href={`https://x.com/${member.handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative w-full h-24 sm:h-32 rounded-md overflow-hidden border"
      aria-label={`${member.name}(@${member.handle})のXアカウントを開く`}
    >
      <div key={index} className="absolute inset-0 animate-in fade-in duration-500">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 768px"
            className="object-cover object-[center_15%]"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-2xl font-display"
            style={{ backgroundColor: PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length] }}
          >
            {member.handle[0].toUpperCase()}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white px-2 py-1 flex items-baseline gap-1.5">
          <span className="text-sm font-medium">{member.name}</span>
          <span className="text-xs text-white/70">@{member.handle}</span>
        </div>
      </div>
    </a>
  )
}
