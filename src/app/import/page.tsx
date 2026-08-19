"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { importSetlistAction, initialActionState } from "@/actions/events"

export default function ImportPage() {
  const [state, formAction, pending] = useActionState(importSetlistAction, initialActionState)

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">#しえるセットリスト インポート</h1>
      <p className="text-sm text-muted-foreground">
        SNSに投稿するセットリストのテキストをそのまま貼り付けて登録できます。
      </p>

      <form action={formAction} className="space-y-4">
        <textarea
          name="rawText"
          required
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
