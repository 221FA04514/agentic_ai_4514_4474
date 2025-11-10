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

export default function ChatInterface({ userRole }: { userRole: "admin" | "parent" }) {
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
    <div className="max-w-5xl mx-auto p-6 flex flex-col h-[calc(100vh-100px)]">
      <div className="flex-1 overflow-y-auto mb-6 space-y-5 pr-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Ask About Policies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Get instant answers about attendance, refunds, housing, calendar, and support services.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 animate-in fade-in duration-300 ${
                message.type === "question" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-2xl p-4 shadow-none border ${
                  message.type === "question"
                    ? "bg-primary/10 border-primary/20 text-foreground ml-12"
                    : "bg-card border-border/40 text-foreground mr-12"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border/20">
                    <p className="font-semibold mb-2 text-foreground/80">Sources</p>
                    <ul className="space-y-1">
                      {message.sources.map((source, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary/60 mt-0.5">•</span>
                          <span>
                            {source.source}
                            {source.page !== undefined && ` (p. ${source.page})`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <time className="text-xs text-muted-foreground/60 mt-3 block">
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
          <div className="flex justify-start gap-4 animate-in fade-in mr-12">
            <Card className="bg-card border border-border/40 p-4 shadow-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-4 border-t border-border/40 pt-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleAsk()}
            placeholder="Ask a question about policies..."
            className="flex-1 px-5 py-3 rounded-lg border border-border/40 bg-card/50 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            disabled={loading}
          />
          <Button
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            className="px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {loading ? "Sending..." : "Send"}
          </Button>
        </div>

        {messages.length > 0 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveConversation}
              className="flex-1 border-border/40 bg-card/50 hover:bg-secondary/50 text-foreground"
            >
              Save Conversation
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/history")}
              className="flex-1 border-border/40 bg-card/50 hover:bg-secondary/50 text-foreground"
            >
              View History
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { ChatInterface }
