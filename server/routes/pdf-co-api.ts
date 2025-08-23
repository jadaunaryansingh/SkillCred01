import { RequestHandler } from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
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

    // Step 1: Upload the PDF file to PDF.co's file storage
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: 'application/pdf'
    });

    console.log('Uploading file to PDF.co...');
    const uploadResponse = await axios.post('https://api.pdf.co/v1/file/upload', formData, {
      headers: {
        'x-api-key': PDF_CO_CONFIG.API_KEY,
        ...formData.getHeaders()
      },
      timeout: PDF_CO_CONFIG.TIMEOUT
    });

    if (!uploadResponse.data || !uploadResponse.data.url) {
      throw new Error('Failed to upload file to PDF.co: ' + JSON.stringify(uploadResponse.data));
    }

    const uploadedFileUrl = uploadResponse.data.url;
    console.log('File uploaded successfully. URL:', uploadedFileUrl);

    // Step 2: Use the uploaded file URL to extract text
    const requestPayload = {
      url: uploadedFileUrl,
      pages: "", // Empty means all pages
      outputFormat: "text"
    };

    console.log('Extracting text from uploaded file...');
    const response = await axios.post('https://api.pdf.co/v1/pdf/convert/to/text', requestPayload, {
      headers: {
        'x-api-key': PDF_CO_CONFIG.API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: PDF_CO_CONFIG.TIMEOUT
    });

    console.log('PDF.co API response status:', response.status);
    console.log('PDF.co API response data:', JSON.stringify(response.data, null, 2));

    // Check for different possible response formats
    let extractedText = null;
    
    if (response.data && response.data.text) {
      extractedText = response.data.text;
    } else if (response.data && response.data.content) {
      extractedText = response.data.content;
    } else if (response.data && response.data.result) {
      extractedText = response.data.result;
    } else if (response.data && typeof response.data === 'string') {
      extractedText = response.data;
    } else if (response.data && response.data.data && response.data.data.text) {
      extractedText = response.data.data.text;
    }

    if (extractedText) {
      console.log('PDF text extraction successful. Text length:', extractedText.length);
      console.log('Text preview:', extractedText.substring(0, 200) + '...');

      return res.json({
        success: true,
        textContent: extractedText,
        message: `Successfully extracted text from PDF "${req.file.originalname}"`
      } as PDFUploadResponse);
    } else {
      console.log('No text content found in response. Available fields:', Object.keys(response.data || {}));
      throw new Error('No text content received from PDF.co API. Response: ' + JSON.stringify(response.data));
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
