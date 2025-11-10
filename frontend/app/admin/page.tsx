"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AdminPage() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [reingesting, setReingesting] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const userData = await res.json()
        if (userData.role !== "admin") {
          router.push("/")
        } else {
          setUser(userData)
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setUploading(true)
    setMessage("")

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }
      }

      setMessage(`Successfully uploaded ${files.length} file(s)`)
    } catch (err) {
      setMessage("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setUploading(false)
    }
  }

  const handleReingest = async () => {
    setReingesting(true)
    setMessage("")

    try {
      const res = await fetch("/api/admin/reingest", { method: "POST" })

      if (res.ok) {
        setMessage("Re-ingest started successfully")
      } else {
        setMessage("Re-ingest failed")
      }
    } catch (err) {
      setMessage("Error: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setReingesting(false)
    }
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
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Chat
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Upload Policy Documents</h2>
          <p className="text-muted-foreground mb-4">Upload PDF files to add to the knowledge base</p>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <div className="text-4xl mb-2">📄</div>
              <p className="font-semibold text-foreground mb-1">
                {uploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground">PDF files only</p>
            </label>
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Re-ingest Documents</h2>
          <p className="text-muted-foreground mb-4">Rebuild the knowledge base from uploaded documents</p>
          <Button onClick={handleReingest} disabled={reingesting} className="w-full">
            {reingesting ? "Re-ingesting..." : "Start Re-ingest"}
          </Button>
        </Card>

        {message && (
          <Card
            className={`p-4 border ${message.includes("Successfully") || message.includes("successfully") ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}
          >
            <p
              className={
                message.includes("Successfully") || message.includes("successfully") ? "text-green-700" : "text-red-700"
              }
            >
              {message}
            </p>
          </Card>
        )}
      </div>
    </main>
  )
}
