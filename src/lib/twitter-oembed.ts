// Fetches a tweet's text via Twitter/X's public oEmbed endpoint. This
// needs no API key (unlike the search/streaming API), so it only works
// for a single known post URL — good enough for "paste a URL, pull the
// text in" rather than any kind of hashtag search/auto-discovery.

const OEMBED_TIMEOUT_MS = 5000

export async function fetchTweetText(tweetUrl: string): Promise<string | null> {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true&dnt=true`

  let res: Response
  try {
    res = await fetch(oembedUrl, { signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS) })
  } catch (err) {
    console.error(`oEmbed fetch failed for ${tweetUrl}`, err)
    return null
  }

  if (!res.ok) return null

  const data = (await res.json()) as { html?: string }
  if (!data.html) return null

  return extractTextFromOEmbedHtml(data.html)
}

// oEmbed returns something like:
//   <blockquote class="twitter-tweet"><p lang="ja" dir="ltr">line1<br>line2</p>&mdash; name (@handle) ...</blockquote>
function extractTextFromOEmbedHtml(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/)
  const inner = match ? match[1] : html

  return inner
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim()
}
