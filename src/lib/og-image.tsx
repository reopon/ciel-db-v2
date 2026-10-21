import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import path from "node:path"

export const OG_SIZE = { width: 1200, height: 630 }

type OgFont = { name: string; data: Buffer; weight: 700 | 900; style: "normal" }

let fontsPromise: Promise<OgFont[]> | null = null

// satori (which ImageResponse uses) needs the actual font bytes, not a
// next/font/google handle — it can't resolve browser-style @font-face CSS.
// Bundled locally rather than fetched at request time: this project's dev
// server has already hit flaky fonts.gstatic.com connectivity more than
// once this session, and an OGP image failing to render for an external
// crawler is worse than a slightly heavier repo.
async function loadFonts(): Promise<OgFont[]> {
  if (!fontsPromise) {
    const dir = path.join(process.cwd(), "src/assets/fonts")
    fontsPromise = Promise.all([
      readFile(path.join(dir, "ZenKakuGothicNew-Bold.ttf")),
      readFile(path.join(dir, "ZenKakuGothicNew-Black.ttf")),
    ]).then(([bold, black]) => [
      { name: "Zen Kaku Gothic New", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "Zen Kaku Gothic New", data: black, weight: 900 as const, style: "normal" as const },
    ])
  }
  return fontsPromise
}

// Shared card used by every opengraph-image.tsx (root fallback, events,
// music): brand wordmark + a category label + a headline + an optional
// meta line (date / venue, release date, etc). Text-only by design — no
// photos, both to avoid rights issues with member photos and to keep
// rendering fast and dependency-free.
export async function renderOgImage({
  label,
  title,
  meta,
}: {
  label: string
  title: string
  meta?: string
}) {
  const fonts = await loadFonts()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#0B1B3D",
          backgroundImage: "linear-gradient(135deg, #0B1B3D 0%, #070B18 100%)",
          color: "#EAF2FF",
          fontFamily: "Zen Kaku Gothic New",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          Gran<span style={{ color: "#3DD1FF" }}>☆</span>Ciel
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#8FA3CC",
              letterSpacing: 4,
              marginBottom: 18,
            }}
          >
            {label}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1.3,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {meta && (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 30,
                fontWeight: 700,
                color: "#C9D7F5",
              }}
            >
              {meta}
            </div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts }
  )
}
