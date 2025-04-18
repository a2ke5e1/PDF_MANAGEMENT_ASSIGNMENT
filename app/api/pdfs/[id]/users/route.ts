import { type NextRequest, NextResponse } from "next/server"
import { isValidObjectId } from "mongoose"
import connectDB from "@/lib/db"
import PDF from "@/models/pdf"
import User from "@/models/user"
import { authenticateRequest } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Connect to database
    await connectDB()

    // Find PDF
    const pdf = await PDF.findOne({
      _id: id,
      userId: auth.userId, // Only the owner can see shared users
    })

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found or access denied" }, { status: 404 })
    }

    // Get users with access
    const users = await User.find({
      _id: { $in: pdf.sharedWith },
    }).select("_id email")

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users with access:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

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

    const { email } = await req.json()

    // Validate email
    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Connect to database
    await connectDB()

    // Find PDF
    const pdf = await PDF.findOne({
      _id: id,
      userId: auth.userId, // Only the owner can add users
    })

    if (!pdf) {
      return NextResponse.json({ message: "PDF not found or access denied" }, { status: 404 })
    }

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "User with this email not found" }, { status: 404 })
    }

    // Check if user is already the owner
    if (user._id.toString() === auth.userId) {
      return NextResponse.json({ message: "You already have access to this PDF" }, { status: 400 })
    }

    // Check if user already has access
    if (pdf.sharedWith.includes(user._id)) {
      return NextResponse.json({ message: "User already has access to this PDF" }, { status: 400 })
    }

    // Add user to shared list
    pdf.sharedWith.push(user._id)
    await pdf.save()

    return NextResponse.json({
      message: "User added successfully",
      user: {
        _id: user._id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Error adding user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
