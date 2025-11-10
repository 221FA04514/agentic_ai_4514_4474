import { cookies } from "next/headers"

const conversationStore: Record<string, any> = {}

export async function GET() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json(null, { status: 401 })
  }

  const user = JSON.parse(auth)
  const userConversations = Object.entries(conversationStore)
    .filter(([_, conv]: any) => conv.userEmail === user.email)
    .map(([id, conv]: any) => ({
      id,
      preview: conv.messages[0]?.content || "Empty conversation",
      messageCount: conv.messages.length,
      timestamp: conv.timestamp,
    }))

  return Response.json(userConversations)
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json(null, { status: 401 })
  }

  const user = JSON.parse(auth)
  const { messages } = await request.json()
  const id = Date.now().toString()

  conversationStore[id] = {
    userEmail: user.email,
    messages,
    timestamp: new Date().toISOString(),
  }

  return Response.json({ id })
}
