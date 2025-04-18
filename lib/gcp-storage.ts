import { Storage } from "@google-cloud/storage"
import { v4 as uuidv4 } from "uuid"

// Initialize GCP Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_CREDENTIALS || "{}"),
})

const bucketName = process.env.GCP_BUCKET_NAME || ""

if (!bucketName) {
  throw new Error("GCP_BUCKET_NAME environment variable is not defined")
}

const bucket = storage.bucket(bucketName)

export const uploadFile = async (file: Buffer, originalFilename: string): Promise<string> => {
  const filename = `${uuidv4()}-${originalFilename.replace(/\s+/g, "_")}`
  const blob = bucket.file(filename)

  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: "application/pdf",
    },
  })

  return new Promise((resolve, reject) => {
    blobStream.on("error", (err) => {
      reject(err)
    })

    blobStream.on("finish", async () => {
      // Make the file public
      await blob.makePublic()

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`
      resolve(publicUrl)
    })

    blobStream.end(file)
  })
}

export const deleteFile = async (filename: string): Promise<void> => {
  // Extract the filename from the URL
  const filenameParts = filename.split("/")
  const filenameOnly = filenameParts[filenameParts.length - 1]

  try {
    await bucket.file(filenameOnly).delete()
  } catch (error) {
    console.error("Error deleting file from GCP:", error)
    throw new Error("Failed to delete file from storage")
  }
}

export const getSignedUrl = async (filename: string): Promise<string> => {
  // Extract the filename from the URL
  const filenameParts = filename.split("/")
  const filenameOnly = filenameParts[filenameParts.length - 1]

  try {
    const [url] = await bucket.file(filenameOnly).getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    })

    return url
  } catch (error) {
    console.error("Error generating signed URL:", error)
    throw new Error("Failed to generate signed URL")
  }
}
