export async function POST(req: Request) {
  const formData = await req.formData()
  const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000"

  try {
    const res = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      return Response.json({ error: "Upload failed" }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Upload error" }, { status: 500 })
  }
}
