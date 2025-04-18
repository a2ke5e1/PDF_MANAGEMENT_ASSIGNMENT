import { type NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectDB from "@/lib/db";
import PDF from "@/models/pdf";
import Comment from "@/models/comment";
import { authenticateRequest } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";
// import { deleteFile, getSignedUrl } from "@/lib/gcp-storage"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

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

    // Get comments
    const comments = await Comment.find({ pdfId: id })
      .sort({ createdAt: -1 })
      .select("_id comment email createdAt");

    // Generate signed URL for the PDF
    // const url = await getSignedUrl(pdf.fileUrl)

    const url = pdf.fileUrl;

    return NextResponse.json({
      pdf: {
        _id: pdf._id,
        filename: pdf.filename,
        uniqueLink: pdf.uniqueLink,
        uploadDate: pdf.uploadDate,
        comments,
        url,
      },
    });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

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
      userId: auth.userId, // Only the owner can delete
    });

    const publicId = pdf.publicId;

    if (!pdf) {
      return NextResponse.json(
        { message: "PDF not found or access denied" },
        { status: 404 }
      );
    }

    // Delete file from storage
    cloudinary.uploader.destroy(publicId, function (error, result) {
      console.log(result, error);
    });

    // Delete comments
    await Comment.deleteMany({ pdfId: id });

    // Delete PDF record
    await PDF.deleteOne({ _id: id });

    return NextResponse.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
