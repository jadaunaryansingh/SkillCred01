const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");

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

// Global debugging middleware
app.use((req, res, next) => {
  console.log('🚀 NEW FUNCTION V3.1 - MIDDLEWARE DEBUG:');
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
    message: "pong - NEW FUNCTION V3.1 WORKING!", 
    version: "3.1",
    timestamp: new Date().toISOString()
  });
});

// Quiz generation endpoint - COMPLETELY REWRITTEN
app.post("/api/generate-quiz", async (req, res) => {
  console.log('🚀 NEW FUNCTION V3.1 - QUIZ GENERATION START ===');
  
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
      error: "V3.1 VALIDATION ERROR: Text content must be at least 50 characters long",
      code: "V3_TEXT_TOO_SHORT",
      receivedLength: textContent?.length || 0,
      requiredLength: 50,
      version: "3.1",
      timestamp: new Date().toISOString()
    });
  }

  // Success response
  res.json({
    success: true,
    message: "V3.1 Quiz generation working!",
    version: "3.1",
    receivedLength: textContent.length,
    questionCount,
    quiz: {
      questions: [
        {
          id: 1,
          question: "Sample question based on: " + textContent.substring(0, 50) + "...",
          options: [
            "Option A",
            "Option B", 
            "Option C",
            "Option D"
          ],
          correctAnswer: 0,
          explanation: "This is a sample question generated from your text content."
        }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// PDF processing endpoint - new format
app.post("/api/process-pdf", async (req, res) => {
  res.json({
    success: false,
    message: "V3.0 - Use client-side PDF processing",
    version: "3.0"
  });
});

// Export with new structure
module.exports.handler = serverless(app);

// Force Netlify to recognize this as a completely new function
console.log('🚀 NEW FUNCTION V3.1 LOADED at:', new Date().toISOString());
console.log('FUNCTION VERSION: QUIZ-API-v3.1-RAW-BODY-PARSER-FIX');
console.log('This is a COMPLETELY NEW function with raw body parser to fix JSON corruption');
console.log('All endpoints have been rewritten with new logic and proper JSON parsing');
