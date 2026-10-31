"use client"

import { useState } from "react"
import Link from "next/link"

export interface RecapCard {
  kicker?: string
  big?: string
  sub?: string
  image?: string
  ranking?: { title: string; count: number }[]
}

const DURATION_MS = 3500

// Instagram/Spotify-Wrapped-style auto-advancing story: one stat per card,
// a thin progress bar per card at the top, tap the left/right third of the
// screen to go back/forward. The last card stays put (no auto-advance off
// the end) and carries a link back to the ordinary calendar page.
//
// The fill bar is a CSS keyframe animation (not a JS setInterval ticking
// React state) — it restarts cleanly on every index change via the `key`,
// and onAnimationEnd is the advance signal, so there's no render-time
// setState-in-effect to fight the React Compiler's purity rule over.
export function RecapStory({ cards, backHref }: { cards: RecapCard[]; backHref: string }) {
  const [index, setIndex] = useState(0)
  const isLast = index === cards.length - 1

  const goPrev = () => setIndex((i) => Math.max(i - 1, 0))
  const goNext = () => setIndex((i) => Math.min(i + 1, cards.length - 1))

  const card = cards[index]

  return (
    <div className="relative h-[calc(100dvh-56px)] min-h-96 overflow-hidden select-none bg-gradient-to-br from-[#0b1220] via-[#111a33] to-[#1d2b55] text-white">
      <style>{`
        @keyframes recap-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      <div className="absolute inset-x-3 top-3 z-20 flex gap-1">
        {cards.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            {i < index || (i === index && isLast) ? (
              <div className="h-full w-full bg-white" />
            ) : i === index ? (
              <div
                key={index}
                className="h-full bg-white"
                style={{ animation: `recap-fill ${DURATION_MS}ms linear forwards` }}
                onAnimationEnd={goNext}
              />
            ) : null}
          </div>
        ))}
      </div>

      <button aria-label="前のカード" onClick={goPrev} className="absolute inset-y-0 left-0 z-10 w-1/3" />
      <button aria-label="次のカード" onClick={goNext} className="absolute inset-y-0 right-0 z-10 w-1/3" />

      <div
        key={index}
        className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center animate-in fade-in zoom-in-95 duration-500"
      >
        {card.image && (
          <div className="mb-1 h-40 w-40 overflow-hidden rounded-2xl border border-white/20 shadow-lg sm:h-48 sm:w-48">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary external domain (X), same as LinkPreviewImage */}
            <img src={card.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        {card.kicker && <div className="text-sm font-medium tracking-wide text-white/60">{card.kicker}</div>}
        {card.ranking ? (
          <ol className="w-full max-w-xs space-y-2 text-left">
            {card.ranking.map((entry, i) => (
              <li key={entry.title} className="flex items-center gap-3">
                <span className="font-display text-xl font-bold text-white/50 w-5 shrink-0">{i + 1}</span>
                <span className="flex-1 font-semibold truncate">{entry.title}</span>
                <span className="text-sm text-white/60 shrink-0">{entry.count}回</span>
              </li>
            ))}
          </ol>
        ) : (
          card.big && <div className="font-display text-4xl font-bold leading-tight sm:text-6xl">{card.big}</div>
        )}
        {card.sub && <div className="text-sm text-white/70">{card.sub}</div>}
        {isLast && (
          <Link
            href={backHref}
            className="mt-6 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#111a33]"
          >
            カレンダーで見る →
          </Link>
        )}
      </div>
    </div>
  )
}
