import { isAdminAuthenticated } from "@/lib/admin-auth"
import { AdminLoginForm } from "@/components/AdminLoginForm"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdminAuthenticated())) {
    return <AdminLoginForm />
  }
  return <>{children}</>
}
