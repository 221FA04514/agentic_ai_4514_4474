import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const auth = cookieStore.get("auth")?.value

  if (!auth) {
    return Response.json(null, { status: 401 })
  }

  try {
    const user = JSON.parse(auth)
    return Response.json(user)
  } catch {
    return Response.json(null, { status: 401 })
  }
}
