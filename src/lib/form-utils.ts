// Shared by admin edit forms (EventEditForm, SongEditForm) for their
// add/remove/reorder row UIs.

export const inputClass =
  "w-full p-2 rounded-md border bg-background text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function newKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

export function moveItem<T>(items: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir
  if (target < 0 || target >= items.length) return items
  const next = items.slice()
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
