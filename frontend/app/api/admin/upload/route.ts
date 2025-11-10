export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ message: "No file provided" }, { status: 400 })
    }

    // Forward to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
    const backendFormData = new FormData()
    backendFormData.append("file", file)

    const res = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      body: backendFormData,
    })

    if (!res.ok) {
      throw new Error("Backend upload failed")
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: "Upload failed" }, { status: 500 })
  }
}
