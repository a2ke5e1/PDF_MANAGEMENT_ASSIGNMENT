import { type NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import connectDB from "@/lib/db";
import PDF from "@/models/pdf";
import { authenticateRequest } from "@/lib/auth";

import { cloudinary } from "@/lib/cloudinary"; // your config path
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

type UploadResponse =
  | { success: true; result?: UploadApiResponse }
  | { success: false; error: UploadApiErrorResponse };

const uploadToCloudinary = (
  fileUri: string,
  fileName: string
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(fileUri, {
        invalidate: true,
        resource_type: "auto",
        filename_override: fileName,
        folder: "pdfs", // any sub-folder name in your cloud
        use_filename: true,
      })
      .then((result) => {
        resolve({ success: true, result });
      })
      .catch((error) => {
        reject({ success: false, error });
      });
  });
};

export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();

    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    // this will be used to upload the file
    const fileUri = "data:" + mimeType + ";" + encoding + "," + base64Data;

    const res = await uploadToCloudinary(fileUri, file.name);

    if (res.success && res.result) {
      const fileUrl = res.result.secure_url;
      const publicId = res.result.public_id;

      // Connect to database
      await connectDB();

      // Create PDF record
      const newPdf = new PDF({
        userId: auth.userId,
        filename: file.name,
        uniqueLink: uuidv4(),
        fileUrl,
        publicId,
        comments: [],
        sharedWith: [],
      });

      await newPdf.save();

      return NextResponse.json(
        {
          message: "PDF uploaded successfully",
          pdf: {
            _id: newPdf._id,
            filename: newPdf.filename,
            uniqueLink: newPdf.uniqueLink,
          },
        },
        { status: 201 }
      );
    } else return NextResponse.json({ message: "failure" });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
