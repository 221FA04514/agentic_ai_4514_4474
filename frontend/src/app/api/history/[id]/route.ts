import { cookies } from "next/headers"

const conversationHistory = new Map<string, any[]>()

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const user = JSON.parse(auth)
    const history = conversationHistory.get(user.email) || []
    const index = Number.parseInt(params.id.split("-")[1])

    if (index >= 0 && index < history.length) {
      history.splice(index, 1)
      return Response.json({ success: true })
    }

    return Response.json({ error: "Not found" }, { status: 404 })
  } catch (error) {
    return Response.json({ error: "Invalid auth" }, { status: 401 })
  }
}
