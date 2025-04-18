"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { Download, Share2, Users, MessageSquare } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import PdfViewer from "@/components/pdf-viewer"
import CommentSection from "@/components/comment-section"
import ShareDialog from "@/components/share-dialog"
import UserAccessDialog from "@/components/user-access-dialog"

interface Pdf {
  _id: string
  filename: string
  uniqueLink: string
  uploadDate: string
  comments: Comment[]
  url: string
}

interface Comment {
  _id: string
  comment: string
  email: string
  createdAt: string
}

export default function PdfDetails() {
  const [pdf, setPdf] = useState<Pdf | null>(null)
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [userAccessDialogOpen, setUserAccessDialogOpen] = useState(false)

  const params = useParams()
  const { toast } = useToast()
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const id = params.id as string

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated && id) {
      fetchPdfDetails()
    }
  }, [isAuthenticated, authLoading, id, router])

  const fetchPdfDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pdfs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch PDF details")
      }

      const data = await response.json()
      setPdf(data.pdf)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch PDF details",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!pdf) return

    try {
      const response = await fetch(`/api/pdfs/${id}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

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
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-[600px] bg-muted rounded"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!pdf) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">PDF not found</h2>
          <p className="text-muted-foreground mb-4">
            The PDF you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold truncate">{pdf.filename}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowComments(!showComments)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              {showComments ? "Hide Comments" : "Show Comments"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setUserAccessDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Manage Access
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`${showComments ? "md:col-span-2" : "md:col-span-3"}`}>
            <Card className="p-4 h-[700px] overflow-hidden">
              <PdfViewer pdfUrl={pdf.url} />
            </Card>
          </div>

          {showComments && (
            <div className="md:col-span-1">
              <CommentSection pdfId={id} comments={pdf.comments} onCommentAdded={fetchPdfDetails} />
            </div>
          )}
        </div>
      </div>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} pdfId={id} uniqueLink={pdf.uniqueLink} />

      <UserAccessDialog
        open={userAccessDialogOpen}
        onOpenChange={setUserAccessDialogOpen}
        pdfId={id}
        onUserAdded={fetchPdfDetails}
      />
    </DashboardLayout>
  )
}
