// Lightweight OGP scraper for event-related links (X posts, blog articles).
// No external HTML parser dependency — this only needs a handful of
// <meta property="og:..."> tags out of the raw HTML.

export interface LinkPreview {
  url: string
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  ok: boolean
}

const FETCH_TIMEOUT_MS = 5000

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"])

function isYouTubeUrl(url: string): boolean {
  try {
    return YOUTUBE_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

interface YouTubeOembedResponse {
  title: string
  author_name: string
  thumbnail_url: string
}

// YouTube watch pages are large (500KB+) and automated/datacenter-IP
// requests are prone to being served a stripped-down or consent-gated
// page, which showed up in practice as the generic OGP scrape below
// timing out or coming back empty. YouTube's oEmbed endpoint is built for
// exactly this (lightweight link-preview metadata) and is far more
// reliable, so YouTube links use it instead of the generic scrape.
async function fetchYouTubeOembed(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 60 * 60 * 24 },
    })
    if (!res.ok) return null

    const data = (await res.json()) as YouTubeOembedResponse
    return {
      url,
      title: data.title ?? null,
      description: data.author_name ?? null,
      image: data.thumbnail_url ?? null,
      siteName: "YouTube",
      ok: true,
    }
  } catch (err) {
    console.error(`YouTube oEmbed failed for ${url}`, err)
    return null
  }
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const empty: LinkPreview = { url, title: null, description: null, image: null, siteName: null, ok: false }

  if (isYouTubeUrl(url)) {
    const oembed = await fetchYouTubeOembed(url)
    if (oembed) return oembed
    // Fall through to the generic scrape below as a last resort (e.g. a
    // private/deleted video, where oEmbed 404s but the watch page might
    // still render something).
  }

  let res: Response
  try {
    res = await fetch(url, {
      headers: {
        // A generic browser UA gets a more complete OGP tag set from more
        // sites than the default fetch UA (some sites serve stripped-down
        // markup to unrecognized clients).
        "User-Agent":
          "Mozilla/5.0 (compatible; ciel-db-v2/1.0; +https://github.com/reopon/ciel-db-v2)",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: 60 * 60 * 24 },
    })
  } catch (err) {
    console.error(`OGP fetch failed for ${url}`, err)
    return empty
  }

  if (!res.ok) return empty

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("text/html")) return empty

  const html = await res.text()
  const og = parseOgTags(html)

  return {
    url,
    title: og.title ?? og.twitterTitle,
    description: og.description ?? og.twitterDescription,
    image: og.image ?? og.twitterImage,
    siteName: og.siteName,
    ok: true,
  }
}

interface RawOgTags {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
}

function parseOgTags(html: string): RawOgTags {
  return {
    title: matchMetaContent(html, "og:title"),
    description: matchMetaContent(html, "og:description"),
    image: matchMetaContent(html, "og:image"),
    siteName: matchMetaContent(html, "og:site_name"),
    twitterTitle: matchMetaContent(html, "twitter:title"),
    twitterDescription: matchMetaContent(html, "twitter:description"),
    twitterImage: matchMetaContent(html, "twitter:image"),
  }
}

function matchMetaContent(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  // content before property, or property before content — meta tags show
  // up in both attribute orders in the wild.
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${escaped}["']`, "i"),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return decodeHtmlEntities(match[1])
  }
  return null
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g, (entity) => HTML_ENTITIES[entity])
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}
