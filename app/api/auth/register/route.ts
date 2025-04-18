import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/user"
import { hashPassword } from "@/lib/auth"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // Parse JSON body
  let body: Record<string, any>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON payload" },
      { status: 400 }
    )
  }

  const { fullName, email, password } = body

  // Validate input
  if (!fullName?.trim() || !email?.trim() || !password) {
    return NextResponse.json(
      { message: "Missing required fields: fullName, email, and password are required." },
      { status: 400 }
    )
  }

  if (!emailRegex.test(email.trim())) {
    return NextResponse.json(
      { message: "Invalid email format." },
      { status: 400 }
    )
  }

  try {
    // Ensure DB connection
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = await new User({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    }).save()

    return NextResponse.json(
      { message: "User registered successfully", userId: newUser._id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { message },
      { status: 500 }
    )
  }
}