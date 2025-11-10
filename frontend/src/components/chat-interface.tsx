"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { askBackend } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Message {
  id: string
  type: "question" | "answer"
  content: string
  sources?: { source: string; page?: number }[]
  timestamp: Date
}

export function ChatInterface({ userRole }: { userRole: "admin" | "parent" }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleAsk = async () => {
    if (!input.trim()) return

    const questionId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      {
        id: questionId,
        type: "question",
        content: input,
        timestamp: new Date(),
      },
    ])

    setInput("")
    setLoading(true)

    try {
      const res = await askBackend(input.trim())
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "answer",
          content: res.answer,
          sources: res.sources,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "answer",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveConversation = async () => {
    try {
      await fetch("/api/history/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            type: m.type,
            content: m.content,
            sources: m.sources,
          })),
        }),
      })
      alert("Conversation saved!")
    } catch (error) {
      alert("Failed to save conversation")
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Ask About Policies</h2>
              <p className="text-muted-foreground max-w-sm">
                Get instant answers about attendance, refunds, housing, calendar, and support services.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-in fade-in duration-300 ${
                message.type === "question" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-2xl p-4 shadow-sm ${
                  message.type === "question"
                    ? "bg-primary text-primary-foreground rounded-3xl rounded-tr-md"
                    : "bg-card border border-border rounded-3xl rounded-tl-md"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed mb-2">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="text-sm opacity-75 mt-3 pt-3 border-t border-current border-opacity-20">
                    <p className="font-semibold mb-1">Sources:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {message.sources.map((source, i) => (
                        <li key={i}>
                          {source.source}
                          {source.page !== undefined && ` (p. ${source.page})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <time className="text-xs opacity-60 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </Card>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start gap-3 animate-in fade-in">
            <Card className="bg-card border border-border p-4 rounded-3xl rounded-tl-md">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-3 rounded-full border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            disabled={loading}
          />
          <Button onClick={handleAsk} disabled={loading || !input.trim()} className="rounded-full px-6">
            {loading ? "..." : "Send"}
          </Button>
        </div>

        {messages.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveConversation} className="flex-1 bg-transparent">
              Save Conversation
            </Button>
            <Button variant="outline" onClick={() => router.push("/history")} className="flex-1">
              View History
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
