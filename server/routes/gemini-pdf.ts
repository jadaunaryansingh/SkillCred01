import { RequestHandler } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const handleGeminiPDFProcessing: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file uploaded",
        message: "Please upload a valid PDF file"
      } as PDFUploadResponse);
    }

    console.log('Processing PDF with Gemini API:', req.file.originalname, 'Size:', req.file.size);

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    // Convert PDF buffer to base64
    const pdfBase64 = req.file.buffer.toString('base64');
    
    // Create the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt for quiz generation
    const prompt = `Please analyze this PDF document and create a comprehensive quiz with the following requirements:

1. Generate 10 multiple-choice questions based on the content
2. Each question should have 4 options (A, B, C, D)
3. Provide the correct answer for each question
4. Questions should cover different aspects and difficulty levels
5. Format the response as:
   Q1. [Question text]
   A) [Option A]
   B) [Option B] 
   C) [Option C]
   D) [Option D]
   Correct Answer: [Letter]

Please ensure the questions are relevant to the document content and well-structured.`;

    // Generate content with the PDF
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBase64
        }
      }
    ]);

    const response = await result.response;
    const extractedText = response.text();
    
    console.log('Gemini PDF processing successful. Response length:', extractedText.length);

    return res.json({
      success: true,
      textContent: extractedText,
      message: `Successfully processed PDF "${req.file.originalname}" with Gemini AI`
    } as PDFUploadResponse);

  } catch (error) {
    console.error('Error processing PDF with Gemini API:', error);

    let errorMessage = "PDF processing error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      error: "PDF processing error",
      message: errorMessage
    } as PDFUploadResponse);
  }
};
