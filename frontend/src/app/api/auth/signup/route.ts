import { cookies } from "next/headers"

const USERS_DB = new Map([
  ["admin@example.com", { password: "admin123", role: "admin" }],
  ["parent@example.com", { password: "parent123", role: "parent" }],
])

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 })
  }

  if (USERS_DB.has(email)) {
    return Response.json({ error: "Email already registered" }, { status: 400 })
  }

  USERS_DB.set(email, { password, role: "parent" })

  const cookieStore = await cookies()
  cookieStore.set("auth", JSON.stringify({ email, role: "parent" }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })

  return Response.json({ success: true })
}
