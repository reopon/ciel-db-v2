import { cookies } from "next/headers"
import { createHash } from "crypto"

export const ADMIN_COOKIE_NAME = "ciel_admin"

// Stateless: don't store the raw password in the cookie. Changing
// ADMIN_PASSWORD invalidates every existing cookie since the hash no
// longer matches, with no server-side session store needed.
export function expectedCookieValue(): string {
  return createHash("sha256").update(`${process.env.ADMIN_PASSWORD}:ciel-admin`).digest("hex")
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false
  const store = await cookies()
  return store.get(ADMIN_COOKIE_NAME)?.value === expectedCookieValue()
}
