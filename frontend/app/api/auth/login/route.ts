import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Simple demo authentication
    const demoAccounts = [
      { email: "admin@example.com", password: "admin123", role: "admin" },
      { email: "parent@example.com", password: "parent123", role: "parent" },
    ]

    const user = demoAccounts.find((u) => u.email === email && u.password === password)

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set("auth", JSON.stringify({ email: user.email, role: user.role }), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: "Server error" }, { status: 500 })
  }
}
