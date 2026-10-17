"use client"

import { useActionState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loginAction } from "@/actions/admin"
import { initialActionState } from "@/lib/action-state"

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState)
  const pathname = usePathname()

  return (
    <main className="max-w-xs mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-display tracking-wide font-semibold">管理者ログイン</h1>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={pathname} />
        <div className="space-y-1">
          <label className="block text-sm font-medium">パスワード</label>
          <input
            name="password"
            type="password"
            required
            autoFocus
            className="w-full p-2 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "確認中..." : "ログイン"}
        </Button>
      </form>

      {state.status === "error" && <p className="text-sm text-destructive">{state.message}</p>}
    </main>
  )
}
