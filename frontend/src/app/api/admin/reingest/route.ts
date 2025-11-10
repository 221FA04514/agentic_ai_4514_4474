export async function POST() {
  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000"

  try {
    const res = await fetch(`${backendUrl}/reingest`, {
      method: "POST",
    })

    if (!res.ok) {
      return Response.json({ error: "Re-ingest failed" }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Re-ingest error" }, { status: 500 })
  }
}
