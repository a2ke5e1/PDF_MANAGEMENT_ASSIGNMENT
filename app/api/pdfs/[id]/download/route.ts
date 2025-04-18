import { type NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/db";
import PDF from "@/models/pdf";
import { authenticateRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid PDF ID" }, { status: 400 });
    }

    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find PDF
    const pdf = await PDF.findOne({
      _id: id,
      $or: [{ userId: auth.userId }, { sharedWith: auth.userId }],
    });

    if (!pdf) {
      return NextResponse.json(
        { message: "PDF not found or access denied" },
        { status: 404 }
      );
    }

    // Generate signed URL for the PDF
    const url = pdf.fileUrl;

    // Redirect to the signed URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
