import { cookies } from "next/headers"
import AdminDashboard from "./dashboard"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")?.value
  const adminInfo = await fetch("https://evm-portal.vercel.app/api/admin/me", {
    cache: "no-store",
    headers: {
      Cookie: `admin_session=${session}`
    }
  })
  if (!adminInfo.ok) return <div>Unauthorized</div>
  const admin = await adminInfo.json()
  console.log(admin)
  return <AdminDashboard admin={admin} />
}
