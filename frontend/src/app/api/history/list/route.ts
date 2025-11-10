import { cookies } from "next/headers"

const conversationHistory = new Map<string, any[]>()

export async function GET() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = JSON.parse(auth)
    const userHistory = conversationHistory.get(user.email) || []

    return Response.json(
      userHistory.map((convo, index) => ({
        id: `${user.email}-${index}`,
        timestamp: convo.timestamp,
        messageCount: convo.messages.length,
        preview:
          convo.messages
            .filter((m: any) => m.type === "question")
            .map((m: any) => m.content)
            .join(" | ")
            .substring(0, 100) + "...",
      })),
    )
  } catch (error) {
    return Response.json({ error: "Invalid auth" }, { status: 401 })
  }
}
