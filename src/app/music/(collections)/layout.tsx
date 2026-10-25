import { MusicTabs } from "@/components/MusicTabs"

export default function MusicCollectionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-display tracking-wide font-semibold">楽曲</h1>
      <MusicTabs />
      {children}
    </main>
  )
}
