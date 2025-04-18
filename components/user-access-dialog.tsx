"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UserAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfId: string
  onUserAdded: () => void
}

interface UserAccess {
  _id: string
  email: string
}

export default function UserAccessDialog({ open, onOpenChange, pdfId, onUserAdded }: UserAccessDialogProps) {
  const [email, setEmail] = useState("")
  const [users, setUsers] = useState<UserAccess[]>([])
  const [loading, setLoading] = useState(false)
  const [addingUser, setAddingUser] = useState(false)
  const [removingUser, setRemovingUser] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open, pdfId])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pdfs/${pdfId}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch users with access",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    try {
      setAddingUser(true)
      const response = await fetch(`/api/pdfs/${pdfId}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add user")
      }

      toast({
        title: "User added",
        description: `${email} now has access to this PDF`,
      })

      setEmail("")
      fetchUsers()
      onUserAdded()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      })
    } finally {
      setAddingUser(false)
    }
  }

  const removeUser = async (userId: string) => {
    try {
      setRemovingUser(userId)
      const response = await fetch(`/api/pdfs/${pdfId}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to remove user")
      }

      toast({
        title: "User removed",
        description: "User access has been revoked",
      })

      fetchUsers()
      onUserAdded()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove user",
        variant: "destructive",
      })
    } finally {
      setRemovingUser(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
          <DialogDescription>Control who can access this PDF</DialogDescription>
        </DialogHeader>

        <form onSubmit={addUser} className="flex items-center space-x-2 mt-4">
          <Input
            placeholder="Enter email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={addingUser || !email.trim()}>
            {addingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Users with access</h4>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm truncate">{user.email}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUser(user._id)}
                    disabled={removingUser === user._id}
                  >
                    {removingUser === user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No additional users have access to this PDF</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
