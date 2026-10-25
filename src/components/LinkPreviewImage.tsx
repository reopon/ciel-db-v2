"use client"

import { useState } from "react"

export function LinkPreviewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) return null

  return (
    // Preview images come from arbitrary external domains, so a plain
    // <img> is used instead of next/image (which requires allowlisting
    // remote domains ahead of time).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-28 h-28 object-cover rounded-md border shrink-0 bg-muted"
      loading="lazy"
    />
  )
}
