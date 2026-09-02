"use client"

import { useActionState, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { importSetlistAction, initialActionState } from "@/actions/events"
import { fetchTweetTextAction } from "@/actions/twitter"

export default function ImportPage() {
  const [state, formAction, pending] = useActionState(importSetlistAction, initialActionState)

  const [tweetUrl, setTweetUrl] = useState("")
  const [rawText, setRawText] = useState("")
  const [fetchMessage, setFetchMessage] = useState<{ status: "success" | "error"; text: string } | null>(null)
  const [fetching, startFetching] = useTransition()

  const handleFetch = () => {
    setFetchMessage(null)
    startFetching(async () => {
      const result = await fetchTweetTextAction(tweetUrl)
      setFetchMessage({ status: result.status, text: result.message })
      if (result.status === "success" && result.text) {
        setRawText(result.text)
      }
    })
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">#しえるセットリスト インポート</h1>
      <p className="text-sm text-muted-foreground">
        SNSに投稿するセットリストのテキストをそのまま貼り付けて登録できます。
      </p>

      <div className="space-y-2">
        <label className="block text-sm font-medium">XのURLから本文を取得(任意)</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={tweetUrl}
            onChange={(e) => setTweetUrl(e.target.value)}
            placeholder="https://x.com/.../status/..."
            className="flex-1 h-9 px-3 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <Button type="button" variant="outline" onClick={handleFetch} disabled={fetching || !tweetUrl}>
            {fetching ? "取得中..." : "取得"}
          </Button>
        </div>
        {fetchMessage && (
          <p className={`text-sm ${fetchMessage.status === "success" ? "text-muted-foreground" : "text-destructive"}`}>
            {fetchMessage.text}
          </p>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <textarea
          name="rawText"
          required
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          className="w-full p-4 rounded-md border bg-background text-sm font-mono h-64 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          placeholder={
            "2025.6.8(日)\nHYPE IDOL！× AGE FES!\n@ 品川グランドホール\n\n#しえるセットリスト\nYakusoku\nWe Can\nMC\n僕らの未来へ\n閃光Believer"
          }
        />

        <Button type="submit" disabled={pending}>
          {pending ? "登録中..." : "登録する"}
        </Button>
      </form>

      {state.status !== "idle" && (
        <p
          className={`text-sm whitespace-pre-wrap ${
            state.status === "success" ? "text-green-700" : "text-destructive"
          }`}
        >
          {state.message}
        </p>
      )}
    </main>
  )
}
