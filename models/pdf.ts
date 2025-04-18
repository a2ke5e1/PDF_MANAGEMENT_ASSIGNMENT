import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  uniqueLink: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  sharedWith: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model is already defined to prevent overwriting during hot reloads
const PDF = mongoose.models.PDF || mongoose.model("PDF", pdfSchema);

export default PDF;
