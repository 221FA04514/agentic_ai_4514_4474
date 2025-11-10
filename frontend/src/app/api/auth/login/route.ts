import { cookies } from "next/headers"

const USERS_DB = new Map([
  ["admin@example.com", { password: "admin123", role: "admin" }],
  ["parent@example.com", { password: "parent123", role: "parent" }],
])

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = USERS_DB.get(email)
  if (!user || user.password !== password) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set("auth", JSON.stringify({ email, role: user.role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({ success: true })
}
