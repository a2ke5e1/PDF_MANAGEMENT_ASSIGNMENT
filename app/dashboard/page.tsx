"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { FileText, Upload, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import DashboardLayout from "@/components/dashboard-layout"
import PdfCard from "@/components/pdf-card"

interface Pdf {
  _id: string
  filename: string
  uniqueLink: string
  uploadDate: string
  comments: string[]
}

export default function Dashboard() {
  const [pdfs, setPdfs] = useState<Pdf[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated) {
      fetchPdfs()
    }
  }, [isAuthenticated, authLoading, router])

  const fetchPdfs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/pdfs", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch PDFs")
      }

      const data = await response.json()
      setPdfs(data.pdfs)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch PDFs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPdfs = pdfs.filter((pdf) => pdf.filename.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My PDFs</h1>
        <Link href="/dashboard/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search PDFs..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-muted rounded-md mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPdfs.map((pdf) => (
            <PdfCard key={pdf._id} pdf={pdf} onRefresh={fetchPdfs} />
          ))}
        </div>
      ) : pdfs.length > 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No PDFs match your search.</p>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No PDFs yet</h3>
            <p className="text-muted-foreground text-center mb-4">Upload your first PDF to get started</p>
            <Link href="/dashboard/upload">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Upload PDF
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}
