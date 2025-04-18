import { type NextRequest, NextResponse } from "next/server"
import { isValidObjectId } from "mongoose"
import connectDB from "@/lib/db"
import PDF from "@/models/pdf"
import Comment from "@/models/comment"
import User from "@/models/user"
import { authenticateRequest } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid PDF ID" }, { status: 400 })
    }

    // Authenticate request
    const auth = await authenticateRequest(req)
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { comment } = await req.json()

    // Validate comment
    if (!comment || typeof comment !== "string" || comment.trim() === "") {
      return NextResponse.json({ message: "Comment is required" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Find PDF
    const pdf = await PDF.findOne({
      _id: id,
      $or: [{ userId: auth.userId }, { sharedWith: auth.userId }],
    })

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found or access denied" }, { status: 404 })
    }

    // Get user info
    const user = await User.findById(auth.userId)
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create comment
    const newComment = new Comment({
      comment,
      email: user.email,
      pdfId: id,
      userId: auth.userId,
    })

    await newComment.save()

    // Add comment to PDF
    pdf.comments.push(newComment._id)
    await pdf.save()

    return NextResponse.json(
      {
        message: "Comment added successfully",
        comment: {
          _id: newComment._id,
          comment: newComment.comment,
          email: newComment.email,
          createdAt: newComment.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
