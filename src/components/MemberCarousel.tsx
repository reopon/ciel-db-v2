import Image from "next/image"

// Hardcoded, not a DB table — this is a small experimental "meet the
// members" banner for the top page, not an archival data type like
// songs/events. photoUrl points at a local file under public/members/
// (official promo photos, supplied by the group's own site) — null
// until a photo is supplied, when a placeholder (colored initial) is
// rendered instead.
const MEMBERS: { name: string; handle: string; photoUrl: string | null; placeholderColor: string }[] = [
  { name: "上丘鈴華", handle: "rinka_granciel", photoUrl: "/members/rinka.jpg", placeholderColor: "#1d4ed8" },
  { name: "小林夢叶", handle: "yumeka_granciel", photoUrl: "/members/yumeka.jpg", placeholderColor: "#2563eb" },
  { name: "櫻かのん", handle: "kanon_granciel", photoUrl: "/members/kanon.jpg", placeholderColor: "#3b82f6" },
  { name: "花奏さくら", handle: "sakura_granciel", photoUrl: "/members/sakura.jpg", placeholderColor: "#1e40af" },
  { name: "氷ノ黎", handle: "rei_granciel", photoUrl: "/members/rei.jpg", placeholderColor: "#1e3a8a" },
  { name: "源かんな", handle: "kanna_granciel", photoUrl: "/members/kanna.jpg", placeholderColor: "#2563eb" },
  { name: "徳富りん", handle: "rin__granciel", photoUrl: "/members/rin.jpg", placeholderColor: "#1d4ed8" },
]

function pickRandomMember() {
  return MEMBERS[Math.floor(Math.random() * MEMBERS.length)]
}

// Server Component (no "use client") — picks one member at render time,
// so each page load/request shows a different member server-side with
// no client JS, no rotation timer, and no hydration-mismatch risk.
export function MemberCarousel() {
  const member = pickRandomMember()

  return (
    <a
      href={`https://x.com/${member.handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative w-full h-24 sm:h-32 rounded-md overflow-hidden border animate-in fade-in duration-500"
      aria-label={`${member.name}(@${member.handle})のXアカウントを開く`}
    >
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
          style={{ backgroundColor: member.placeholderColor }}
        >
          {member.handle[0].toUpperCase()}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white px-2 py-1 flex items-baseline gap-1.5">
        <span className="text-sm font-medium">{member.name}</span>
        <span className="text-xs text-white/70">@{member.handle}</span>
      </div>
    </a>
  )
}
