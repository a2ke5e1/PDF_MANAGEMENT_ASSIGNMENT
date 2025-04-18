import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import PDF from "@/models/pdf"
import { getSignedUrl } from "@/lib/gcp-storage"

export async function GET(req: NextRequest, { params }: { params: { uniqueId: string } }) {
  try {
    const { uniqueId } = params

    // Validate unique ID
    if (!uniqueId || uniqueId.trim() === "") {
      return NextResponse.json({ message: "Invalid link" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Find PDF by unique link
    const pdf = await PDF.findOne({ uniqueLink: uniqueId })

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found or link is invalid" }, { status: 404 })
    }

    // Generate signed URL for the PDF
    const url = await getSignedUrl(pdf.fileUrl)

    return NextResponse.json({
      pdf: {
        _id: pdf._id,
        filename: pdf.filename,
        url,
      },
    })
  } catch (error) {
    console.error("Error fetching shared PDF:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
