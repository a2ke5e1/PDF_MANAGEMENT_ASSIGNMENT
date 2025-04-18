import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import PDF from "@/models/pdf"
import { authenticateRequest } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(req)
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectDB()

    // Get PDFs for the authenticated user
    const pdfs = await PDF.find({
      $or: [{ userId: auth.userId }, { sharedWith: auth.userId }],
    })
      .sort({ uploadDate: -1 })
      .select("_id filename uniqueLink uploadDate comments")

    return NextResponse.json({ pdfs })
  } catch (error) {
    console.error("Error fetching PDFs:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
