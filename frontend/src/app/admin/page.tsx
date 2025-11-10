"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function AdminPage() {
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [reingesting, setReingesting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok || (await res.json()).role !== "admin") {
        router.push("/")
      } else {
        setUser(await res.json())
      }
      setLoading(false)
    }
    checkAuth()
  }, [router])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setUploading(true)
    setUploadStatus("")

    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append("files", file))

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      setUploadStatus("Files uploaded successfully! Re-ingesting...")

      const reingRes = await fetch("/api/admin/reingest", {
        method: "POST",
      })

      if (!reingRes.ok) throw new Error("Re-ingest failed")

      setUploadStatus("Files uploaded and ingested successfully!")
    } catch (error) {
      setUploadStatus("Error uploading files. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleReingest = async () => {
    setReingesting(true)
    setUploadStatus("")

    try {
      const res = await fetch("/api/admin/reingest", {
        method: "POST",
      })

      if (!res.ok) throw new Error("Re-ingest failed")

      setUploadStatus("Re-ingest completed successfully!")
    } catch (error) {
      setUploadStatus("Error during re-ingest. Please try again.")
    } finally {
      setReingesting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Chat
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Upload Policy Documents</h2>
          <p className="text-muted-foreground mb-4">Upload PDF files to add to the policy knowledge base.</p>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-card/50 transition">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <p className="text-foreground font-medium mb-2">Click to upload or drag files</p>
              <p className="text-sm text-muted-foreground">PDF files only</p>
            </label>
          </div>

          {uploadStatus && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                uploadStatus.includes("successfully")
                  ? "bg-green-500/10 border border-green-500/20 text-green-700"
                  : "bg-orange-500/10 border border-orange-500/20 text-orange-700"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Re-ingest Knowledge Base</h2>
          <p className="text-muted-foreground mb-4">Manually trigger re-ingestion of all policy documents.</p>

          <Button onClick={handleReingest} disabled={reingesting} className="w-full">
            {reingesting ? "Re-ingesting..." : "Trigger Re-ingest"}
          </Button>
        </Card>

        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold text-foreground mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
            <li>Upload PDF files containing policy documents</li>
            <li>Files are automatically processed and indexed</li>
            <li>Parents can immediately ask questions about policies</li>
            <li>Use re-ingest to refresh the knowledge base</li>
          </ul>
        </Card>
      </div>
    </main>
  )
}
