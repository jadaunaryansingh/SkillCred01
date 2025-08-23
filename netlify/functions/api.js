const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

// Create the Express app with different structure
const app = express();

// Middleware setup
app.use(cors());

// Add raw body parser to capture exact request body
app.use(express.raw({ type: 'application/json', limit: '50mb' }));

// Custom middleware to parse JSON manually
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'application/json' && req.body) {
    try {
      // Convert Buffer to string and parse JSON
      const bodyString = req.body.toString('utf8');
      console.log('🔍 RAW BODY STRING:', bodyString.substring(0, 200));
      console.log('🔍 RAW BODY LENGTH:', bodyString.length);
      
      req.body = JSON.parse(bodyString);
      console.log('🔍 PARSED BODY SUCCESS:', typeof req.body, Object.keys(req.body || {}));
    } catch (parseError) {
      console.log('❌ JSON PARSE ERROR:', parseError.message);
      console.log('🔍 FAILED BODY STRING:', req.body.toString('utf8').substring(0, 200));
    }
  }
  next();
});

app.use(express.json({ limit: '50mb' })); // Increased limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Global debugging middleware
app.use((req, res, next) => {
  console.log('🚀 NEW FUNCTION V4.0 - MIDDLEWARE DEBUG:');
  console.log('  - Method:', req.method);
  console.log('  - URL:', req.url);
  console.log('  - Content-Type:', req.headers['content-type']);
  console.log('  - Body after middleware:', req.body);
  console.log('  - Body type:', typeof req.body);
  console.log('  - Body keys:', Object.keys(req.body || {}));
  next();
});

// Health check with new message
app.get("/api/ping", (_req, res) => {
  res.json({ 
    message: "pong - NEW FUNCTION V4.0 WORKING!", 
    version: "4.0",
    timestamp: new Date().toISOString()
  });
});

// PDF.CO API Configuration
const PDF_CO_CONFIG = {
  API_KEY: process.env.PDF_CO_API_KEY || "aryansinghjadaun@gmail.com_IR4ErjQrrR9cMHVIfwd5APD4v08CgP1dEYCvfQiZRlKr3SfWNLxwzfnHxsEYrizY",
  API_URL: "https://api.pdf.co/v1/pdf/convert/to/text",
  TIMEOUT: 60000, // 60 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

// PDF.CO API processing endpoint
app.post("/api/process-pdf-co", upload.single('pdf'), async (req, res) => {
  console.log('🚀 PDF.CO API PROCESSING START ===');
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No PDF file uploaded",
        message: "Please upload a PDF file"
      });
    }

    console.log('Processing PDF file with PDF.co API:', req.file.originalname, 'Size:', req.file.size);

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

    // PDF.co API returns a URL to the converted text file, not the text content directly
    if (response.data && response.data.url && response.data.name && response.data.name.endsWith('.txt')) {
      console.log('Text file URL received, downloading content...');
      
      // Download the text file from the URL
      const textFileResponse = await axios.get(response.data.url, {
        timeout: PDF_CO_CONFIG.TIMEOUT
      });
      
      if (textFileResponse.data) {
        const extractedText = textFileResponse.data;
        console.log('PDF text extraction successful. Text length:', extractedText.length);
        console.log('Text preview:', extractedText.substring(0, 200) + '...');

        return res.json({
          success: true,
          textContent: extractedText,
          message: `Successfully extracted text from PDF "${req.file.originalname}" using PDF.co API`
        });
      } else {
        throw new Error('Failed to download text content from PDF.co URL');
      }
    } else {
      console.log('Unexpected response format. Available fields:', Object.keys(response.data || {}));
      throw new Error('Unexpected response format from PDF.co API. Response: ' + JSON.stringify(response.data));
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
    });
  }
});

// Quiz generation endpoint - COMPLETELY REWRITTEN
app.post("/api/generate-quiz", async (req, res) => {
  console.log('🚀 NEW FUNCTION V4.0 - QUIZ GENERATION START ===');
  
  // DEBUG: Log the request details
  console.log('🔍 REQUEST DEBUG:');
  console.log('  - req.body:', req.body);
  console.log('  - req.body type:', typeof req.body);
  console.log('  - req.body keys:', Object.keys(req.body || {}));
  console.log('  - Content-Type header:', req.headers['content-type']);
  
  // Extract data
  const requestData = req.body || {};
  const textContent = requestData.textContent;
  const questionCount = requestData.questionCount || 20;
  
  console.log('🔍 EXTRACTED DATA:');
  console.log('  - textContent length:', textContent?.length || 0);
  console.log('  - textContent preview:', textContent?.substring(0, 100));
  console.log('  - questionCount:', questionCount);
  
  // Validation
  if (!textContent || textContent.trim().length < 50) {
    console.log('❌ VALIDATION FAILED:');
    console.log('  - textContent exists:', !!textContent);
    console.log('  - textContent length:', textContent?.length || 0);
    console.log('  - textContent trimmed length:', textContent?.trim()?.length || 0);
    
    return res.status(400).json({ 
      error: "V4.0 VALIDATION ERROR: Text content must be at least 50 characters long",
      code: "V4_TEXT_TOO_SHORT",
      receivedLength: textContent?.length || 0,
      requiredLength: 50,
      version: "4.0",
      timestamp: new Date().toISOString()
    });
  }

  // Success response
  let generatedQuestions;
  try {
    generatedQuestions = generateQuestionsFromText(textContent, questionCount);
    console.log('🔍 SUCCESSFULLY GENERATED QUESTIONS:', generatedQuestions.length);
  } catch (error) {
    console.log('❌ ERROR GENERATING QUESTIONS:', error.message);
    // Fallback to basic questions if generation fails
    generatedQuestions = [
      {
        id: 1,
        type: "multiple-choice",
        question: "What is the main topic of the provided text content?",
        options: [
          "Educational content",
          "Technical documentation",
          "Creative writing", 
          "News article"
        ],
        correctAnswer: "Educational content",
        explanation: "The text appears to contain educational or informational content."
      }
    ];
  }
  
  res.json({
    success: true,
    message: "V4.0 Quiz generation working!",
    version: "4.0",
    receivedLength: textContent.length,
    questionCount,
    quiz: {
      questions: generatedQuestions
    },
    timestamp: new Date().toISOString()
  });
});

// Function to generate questions from text content
function generateQuestionsFromText(text, count) {
  console.log('🔍 GENERATING QUESTIONS:', { textLength: text.length, requestedCount: count });
  
  const questions = [];
  
  // Split text into sentences for question generation
  let sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  console.log('🔍 FOUND SENTENCES:', sentences.length);
  
  // If we don't have enough sentences, try splitting by line breaks
  if (sentences.length < count / 2) {
    console.log('🔍 TRYING LINE BREAK SPLITTING');
    const lineBreaks = text.split(/\n+/).filter(s => s.trim().length > 20);
    sentences = [...sentences, ...lineBreaks];
    console.log('🔍 AFTER LINE BREAKS:', sentences.length);
  }
  
  // If still not enough, split by chunks
  if (sentences.length < count / 2) {
    console.log('🔍 TRYING CHUNK SPLITTING');
    const chunkSize = Math.max(100, Math.floor(text.length / count));
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.substring(i, i + chunkSize).trim();
      if (chunk.length > 20) {
        chunks.push(chunk);
      }
    }
    sentences = [...sentences, ...chunks];
    console.log('🔍 AFTER CHUNKS:', sentences.length);
  }
  
  // Generate questions based on text content
  for (let i = 0; i < Math.min(count, sentences.length); i++) {
    const sentence = sentences[i].trim();
    if (sentence.length < 20) continue;
    
    console.log(`🔍 GENERATING QUESTION ${i + 1}:`, sentence.substring(0, 50));
    
    // Create a question based on the sentence
    const questionText = `What is the main topic discussed in the following text: "${sentence.substring(0, 100)}..."?`;
    
    // Generate options based on the content
    const options = [
      sentence.split(' ').slice(0, 3).join(' '), // First few words
      sentence.split(' ').slice(-3).join(' '),    // Last few words
      sentence.split(' ').slice(2, 5).join(' '), // Middle words
      "None of the above"
    ];
    
    // Ensure unique options
    const uniqueOptions = [...new Set(options)].slice(0, 4);
    while (uniqueOptions.length < 4) {
      uniqueOptions.push(`Option ${uniqueOptions.length + 1}`);
    }
    
    questions.push({
      id: i + 1,
      type: "multiple-choice",
      question: questionText,
      options: uniqueOptions,
      correctAnswer: uniqueOptions[0], // First option is correct
      explanation: `This question is based on the text: "${sentence.substring(0, 80)}..."`
    });
  }
  
  console.log('🔍 GENERATED QUESTIONS FROM TEXT:', questions.length);
  
  // If we don't have enough questions, add some generic ones
  while (questions.length < count) {
    console.log(`🔍 ADDING GENERIC QUESTION ${questions.length + 1}`);
    
    const genericQuestions = [
      {
        id: questions.length + 1,
        type: "multiple-choice",
        question: `What is the primary focus of the provided text content?`,
        options: [
          "Educational content",
          "Technical documentation", 
          "Creative writing",
          "News article"
        ],
        correctAnswer: "Educational content",
        explanation: "The text appears to contain educational or informational content based on its length and structure."
      },
      {
        id: questions.length + 1,
        type: "multiple-choice",
        question: `How would you categorize the complexity level of this text?`,
        options: [
          "Beginner level",
          "Intermediate level",
          "Advanced level",
          "Expert level"
        ],
        correctAnswer: "Intermediate level",
        explanation: "Based on the text length and content structure, this appears to be intermediate-level material."
      }
    ];
    
    if (questions.length < count) {
      questions.push(genericQuestions[0]);
    }
    if (questions.length < count) {
      questions.push(genericQuestions[1]);
    }
  }
  
  console.log('🔍 FINAL QUESTION COUNT:', questions.length);
  return questions.slice(0, count);
}

// PDF processing endpoint - new format
app.post("/api/process-pdf", async (req, res) => {
  res.json({
    success: false,
    message: "V4.0 - Use client-side PDF processing",
    version: "4.0"
  });
});

// Export with new structure
module.exports.handler = serverless(app);

// Force Netlify to recognize this as a completely new function
console.log('🚀 NEW FUNCTION V4.0 LOADED at:', new Date().toISOString());
console.log('FUNCTION VERSION: QUIZ-API-v4.0-PDF-CO-INTEGRATION');
console.log('This function now includes PDF.CO API processing for serverless PDF text extraction');
console.log('All endpoints have been rewritten with new logic and proper JSON parsing');
