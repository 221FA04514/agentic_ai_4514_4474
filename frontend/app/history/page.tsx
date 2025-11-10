"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ConversationPreview {
  id: string
  preview: string
  messageCount: number
  timestamp: string
}

export default function HistoryPage() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)

        const historyRes = await fetch("/api/history/list")
        if (historyRes.ok) {
          const data = await historyRes.json()
          setConversations(data)
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this conversation?")) return

    await fetch(`/api/history/${id}`, { method: "DELETE" })
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Conversation History</h1>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Chat
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {conversations.length === 0 ? (
          <Card className="p-8 text-center border border-border">
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <Button onClick={() => router.push("/")}>Start Chatting</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv) => (
              <Card key={conv.id} className="p-4 border border-border hover:border-primary transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-foreground font-semibold line-clamp-2">{conv.preview}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{conv.messageCount} messages</span>
                      <span>{new Date(conv.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(conv.id)}
                    className="ml-2 text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
