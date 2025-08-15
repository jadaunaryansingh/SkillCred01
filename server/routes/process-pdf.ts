import { RequestHandler } from "express";
import multer from "multer";
import { PDFUploadResponse } from "@shared/api";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

export const handlePDFUpload = upload.single('pdf');

export const handlePDFProcessing: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file uploaded",
        message: "Please upload a valid PDF file"
      } as PDFUploadResponse);
    }

    console.log('Processing PDF file:', req.file.originalname, 'Size:', req.file.size);

    // For now, return a helpful message directing users to use client-side processing
    // The pdf-parse library has issues with test file dependencies
    const message = `PDF file "${req.file.originalname}" received. Due to server-side PDF processing limitations, the client-side PDF processor will handle the text extraction automatically.`;

    return res.json({
      success: false,
      error: "Server-side PDF processing temporarily unavailable",
      message: message
    } as PDFUploadResponse);

  } catch (error) {
    console.error('Error processing PDF:', error);

    return res.status(500).json({
      success: false,
      error: "PDF processing error",
      message: "Please try uploading the file again or use the text input instead."
    } as PDFUploadResponse);
  }
};
