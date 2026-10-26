"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { registerEventAction } from "@/actions/events"
import { initialActionState } from "@/lib/action-state"
import type { Venue } from "@/lib/types"

export function RegisterForm({ venues }: { venues: Pick<Venue, "id" | "name">[] }) {
  const [state, formAction, pending] = useActionState(registerEventAction, initialActionState)

  return (
    <>
      <form action={formAction} className="space-y-4">
        <Field label="イベント名">
          <input name="eventName" type="text" required className={inputClass} />
        </Field>
        <Field label="会場">
          <input name="location" type="text" required list="venue-options" className={inputClass} />
          <datalist id="venue-options">
            {venues.map((venue) => (
              <option key={venue.id} value={venue.name} />
            ))}
          </datalist>
        </Field>
        <Field label="日付">
          <input name="date" type="date" required className={inputClass} />
        </Field>
        <Field label="備考">
          <textarea name="note" rows={2} className={inputClass} />
        </Field>
        <Field label="セットリスト(1行1曲。MCなど曲以外の行も入れてOKです)">
          <textarea
            name="setlistText"
            rows={8}
            className={`${inputClass} font-mono`}
            placeholder={"例：\nAnswer\nMC\nTrue Love"}
          />
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? "登録中..." : "登録"}
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
    </>
  )
}

const inputClass =
  "w-full p-2 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}
