"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [user, setUser] = useState<{ email: string; role: "admin" | "parent" } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
      } else {
        router.push("/login")
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/login")
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

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Policy Assistant
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {user.role === "admin" ? "Administrator" : "Parent"} • {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/history")}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              History
            </Button>
            {user.role === "admin" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin")}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              >
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <ChatInterface userRole={user.role} />
    </main>
  )
}
