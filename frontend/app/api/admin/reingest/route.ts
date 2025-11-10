export async function POST() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"

    const res = await fetch(`${backendUrl}/reingest`, {
      method: "POST",
    })

    if (!res.ok) {
      throw new Error("Backend reingest failed")
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: "Reingest failed" }, { status: 500 })
  }
}
