"use client"

import { useEffect, useState } from "react"

// Hardcoded, not a DB table — this is a small experimental "meet the
// members" banner for the top page, not an archival data type like
// songs/events. photoUrl is left null until real promo photos are
// supplied; a placeholder (colored initial) renders in the meantime.
const MEMBERS: { handle: string; photoUrl: string | null }[] = [
  { handle: "rinka_granciel", photoUrl: null },
  { handle: "yumeka_granciel", photoUrl: null },
  { handle: "kanon_granciel", photoUrl: null },
  { handle: "sakura_granciel", photoUrl: null },
  { handle: "rei_granciel", photoUrl: null },
  { handle: "kanna_granciel", photoUrl: null },
  { handle: "rin__granciel", photoUrl: null },
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
      aria-label={`@${member.handle} のXアカウントを開く`}
    >
      <div key={index} className="absolute inset-0 animate-in fade-in duration-500">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external promo photo, not an optimizable local/remote asset yet
          <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-2xl font-display"
            style={{ backgroundColor: PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length] }}
          >
            {member.handle[0].toUpperCase()}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs px-2 py-1">
          @{member.handle}
        </div>
      </div>
    </a>
  )
}
