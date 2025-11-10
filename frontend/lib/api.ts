export async function askBackend(question: string) {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000"
  const res = await fetch(`${url}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) throw new Error("Backend error")
  return res.json() as Promise<{ answer: string; sources: { source: string; page?: number }[] }>
}
