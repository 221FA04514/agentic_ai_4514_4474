import { cookies } from "next/headers"

const conversationStore: Record<string, any> = {}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json(null, { status: 401 })
  }

  const user = JSON.parse(auth)
  const conversation = conversationStore[params.id]

  if (!conversation || conversation.userEmail !== user.email) {
    return Response.json(null, { status: 404 })
  }

  return Response.json(conversation)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json(null, { status: 401 })
  }

  const user = JSON.parse(auth)
  const conversation = conversationStore[params.id]

  if (!conversation || conversation.userEmail !== user.email) {
    return Response.json(null, { status: 404 })
  }

  delete conversationStore[params.id]
  return Response.json({ success: true })
}
