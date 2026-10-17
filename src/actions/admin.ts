"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ADMIN_COOKIE_NAME, expectedCookieValue } from "@/lib/admin-auth"
import type { ActionState } from "@/lib/action-state"

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "")
  const redirectTo = String(formData.get("redirectTo") ?? "/events/edit")

  if (!process.env.ADMIN_PASSWORD) {
    return { status: "error", message: "ADMIN_PASSWORD が設定されていません" }
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { status: "error", message: "パスワードが違います" }
  }

  const store = await cookies()
  store.set(ADMIN_COOKIE_NAME, expectedCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect(redirectTo)
}
