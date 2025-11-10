import { cookies } from "next/headers"

const conversationHistory = new Map<string, any[]>()

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = JSON.parse(auth)
    const { messages } = await req.json()

    if (!conversationHistory.has(user.email)) {
      conversationHistory.set(user.email, [])
    }

    conversationHistory.get(user.email)?.push({
      timestamp: new Date(),
      messages,
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Save failed" }, { status: 500 })
  }
}
