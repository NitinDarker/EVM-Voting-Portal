import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value
  const user = token && verifyToken(token)
  if (!user) redirect("/login")
  return children
}
