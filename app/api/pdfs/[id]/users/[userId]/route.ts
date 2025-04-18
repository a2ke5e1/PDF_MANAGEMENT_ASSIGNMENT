import { type NextRequest, NextResponse } from "next/server"
import { isValidObjectId } from "mongoose"
import connectDB from "@/lib/db"
import PDF from "@/models/pdf"
import { authenticateRequest } from "@/lib/auth"

export async function DELETE(req: NextRequest, { params }: { params: { id: string; userId: string } }) {
  try {
    const { id, userId } = params

    // Validate IDs
    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 })
    }

    // Authenticate request
    const auth = await authenticateRequest(req)
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Find PDF
    const pdf = await PDF.findOne({
      _id: id,
      userId: auth.userId, // Only the owner can remove users
    })

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found or access denied" }, { status: 404 })
    }

    // Remove user from shared list
    pdf.sharedWith = pdf.sharedWith.filter((id) => id.toString() !== userId)

    await pdf.save()

    return NextResponse.json({ message: "User access removed successfully" })
  } catch (error) {
    console.error("Error removing user access:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
