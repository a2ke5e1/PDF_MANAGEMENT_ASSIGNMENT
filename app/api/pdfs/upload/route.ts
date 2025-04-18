import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import  connectDB  from "@/lib/db"
import PDF from "@/models/pdf"
import { authenticateRequest } from "@/lib/auth"
import { uploadFile } from "@/lib/gcp-storage"

export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(req)
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ message: "Only PDF files are allowed" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload file to GCP
    const fileUrl = await uploadFile(buffer, file.name)

    // Connect to database
    await connectDB()

    // Create PDF record
    const newPdf = new PDF({
      userId: auth.userId,
      filename: file.name,
      uniqueLink: uuidv4(),
      fileUrl,
      comments: [],
      sharedWith: [],
    })

    await newPdf.save()

    return NextResponse.json(
      {
        message: "PDF uploaded successfully",
        pdf: {
          _id: newPdf._id,
          filename: newPdf.filename,
          uniqueLink: newPdf.uniqueLink,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error uploading PDF:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
