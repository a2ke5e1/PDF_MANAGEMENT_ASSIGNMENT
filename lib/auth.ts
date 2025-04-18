import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined")
}

export interface JwtPayload {
  userId: string
  email: string
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" })
}

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET!) as JwtPayload
  } catch (error) {
    throw new Error("Invalid or expired token")
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const authenticateRequest = async (req: NextRequest) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return null
    }

    // Verify token
    const decoded = verifyToken(token)
    return decoded
  } catch (error) {
    return null
  }
}
