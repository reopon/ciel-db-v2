import { fetchVenuesForPicker } from "@/lib/events"
import { RegisterForm } from "@/components/RegisterForm"

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  const venues = await fetchVenuesForPicker()

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-display tracking-wide font-semibold">ライブ登録</h1>
      <RegisterForm venues={venues} />
    </main>
  )
}
