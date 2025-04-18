"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Copy, Check, Share2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfId: string
  uniqueLink: string
}

export default function ShareDialog({ open, onOpenChange, pdfId, uniqueLink }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareLink = `${window.location.origin}/shared/${uniqueLink}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "The share link has been copied to your clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      })
    }
  }

  const shareViaEmail = () => {
    const subject = "Check out this PDF"
    const body = `I wanted to share this PDF with you: ${shareLink}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share PDF</DialogTitle>
          <DialogDescription>Anyone with this link can view this PDF</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Input value={shareLink} readOnly className="w-full" />
          </div>
          <Button size="icon" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mt-4">
          <Button onClick={shareViaEmail} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share via Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
