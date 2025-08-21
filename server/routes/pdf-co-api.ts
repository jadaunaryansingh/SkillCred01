import { RequestHandler } from "express";
import multer from "multer";
import axios from "axios";
import { PDFUploadResponse } from "@shared/api";
import { PDF_CO_CONFIG, validatePDFCoConfig } from "../config/pdf-co";

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

export const handlePDFCoProcessing: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file uploaded",
        message: "Please upload a valid PDF file"
      } as PDFUploadResponse);
    }

    console.log('Processing PDF file with PDF.co API:', req.file.originalname, 'Size:', req.file.size);

    // Validate PDF.co configuration
    validatePDFCoConfig();

    // Convert PDF buffer to base64
    const pdfBase64 = req.file.buffer.toString('base64');

    // Prepare the request payload for PDF.co API
    const requestPayload = {
      url: `data:application/pdf;base64,${pdfBase64}`,
      pages: "", // Empty means all pages
      outputFormat: "text"
    };

    // Make request to PDF.co API
    const response = await axios.post(PDF_CO_CONFIG.API_URL, requestPayload, {
      headers: {
        'x-api-key': PDF_CO_CONFIG.API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: PDF_CO_CONFIG.TIMEOUT
    });

    if (response.data && response.data.text) {
      const extractedText = response.data.text;
      
      console.log('PDF text extraction successful. Text length:', extractedText.length);

      return res.json({
        success: true,
        textContent: extractedText,
        message: `Successfully extracted text from PDF "${req.file.originalname}"`
      } as PDFUploadResponse);
    } else {
      throw new Error('No text content received from PDF.co API');
    }

  } catch (error) {
    console.error('Error processing PDF with PDF.co API:', error);

    let errorMessage = "PDF processing error";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `PDF.co API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage = "PDF.co API request failed - no response received";
      } else {
        errorMessage = `PDF.co API Error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      error: "PDF processing error",
      message: errorMessage
    } as PDFUploadResponse);
  }
};
