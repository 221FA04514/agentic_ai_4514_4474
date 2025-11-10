"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ConversationItem {
  id: string
  timestamp: Date
  messageCount: number
  preview: string
}

export default function HistoryPage() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) {
        router.push("/login")
        return
      }
      const userData = await res.json()
      setUser(userData)
      fetchHistory()
    }
    checkAuth()
  }, [router])

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history/list")
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error("Failed to fetch history")
    } finally {
      setLoading(false)
    }
  }

  const deleteConversation = async (id: string) => {
    if (!confirm("Delete this conversation?")) return
    try {
      await fetch(`/api/history/${id}`, { method: "DELETE" })
      setConversations((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      alert("Failed to delete conversation")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conversation History</h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Chat
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {conversations.length === 0 ? (
          <Card className="p-12 text-center bg-muted/30 border-dashed">
            <p className="text-muted-foreground text-lg mb-2">No conversations yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start chatting to build your conversation history</p>
            <Button onClick={() => router.push("/")}>Start Chatting</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{conversation.messageCount} messages</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{conversation.preview}</p>
                    <time className="text-xs text-muted-foreground">
                      {new Date(conversation.timestamp).toLocaleString()}
                    </time>
                  </div>
                  <button
                    onClick={() => deleteConversation(conversation.id)}
                    className="text-destructive hover:text-destructive/80 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
