"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Download, FileText } from "lucide-react"
import PdfViewer from "@/components/pdf-viewer"

interface SharedPdf {
  _id: string
  filename: string
  url: string
}

export default function SharedPdfView() {
  const [pdf, setPdf] = useState<SharedPdf | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const { toast } = useToast()
  const uniqueId = params.uniqueId as string

  useEffect(() => {
    if (uniqueId) {
      fetchSharedPdf()
    }
  }, [uniqueId])

  const fetchSharedPdf = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/shared/${uniqueId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch shared PDF")
      }

      const data = await response.json()
      setPdf(data.pdf)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "This shared PDF is not available")
      setPdf(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!pdf) return

    try {
      const response = await fetch(`/api/shared/${uniqueId}/download`)

      if (!response.ok) {
        throw new Error("Failed to download PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = pdf.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An error occurred during download",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[600px] bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !pdf) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">PDF Not Available</h2>
            <p className="text-muted-foreground text-center mb-4">
              {error || "This shared PDF is not available or has been removed."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold truncate">{pdf.filename}</h1>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <Card className="p-4 h-[700px] overflow-hidden">
        <PdfViewer pdfUrl={pdf.url} />
      </Card>
    </div>
  )
}
