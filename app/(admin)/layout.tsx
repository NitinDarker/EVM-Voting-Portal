import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminToken } from "@/lib/adminAuth"

export default async function Layout({ children } : { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value
  const admin = token && verifyAdminToken(token)
  if (!admin || !admin.isAdmin) redirect("/admin/login")
  return children
}
