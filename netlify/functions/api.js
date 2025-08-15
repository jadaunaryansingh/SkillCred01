const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");

// Create the Express app with different structure
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global debugging middleware
app.use((req, res, next) => {
  console.log('🚀 NEW FUNCTION V3.0 - MIDDLEWARE DEBUG:');
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
    message: "pong - NEW FUNCTION V3.0 WORKING!", 
    version: "3.0",
    timestamp: new Date().toISOString()
  });
});

// Quiz generation endpoint - COMPLETELY REWRITTEN
app.post("/api/generate-quiz", async (req, res) => {
  console.log('🚀 NEW FUNCTION V3.0 - QUIZ GENERATION START ===');
  
  // DEBUG PATCH: Log raw request before any processing
  console.log('🔍 RAW REQUEST DEBUG:');
  console.log('  - Raw req.body:', req.body);
  console.log('  - Raw req.body type:', typeof req.body);
  console.log('  - Raw req.body keys:', Object.keys(req.body || {}));
  console.log('  - Raw req.body stringified:', JSON.stringify(req.body));
  console.log('  - Raw req.body length:', JSON.stringify(req.body).length);
  
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request body type:', typeof req.body);
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Content-Type header:', req.headers['content-type']);
  
  // Extract data with new structure
  const requestData = req.body || {};
  const textContent = requestData.textContent;
  const questionCount = requestData.questionCount || 20;
  
  // DEBUG PATCH: Check for different field names
  console.log('🔍 FIELD NAME DEBUG:');
  console.log('  - textContent field:', textContent);
  console.log('  - text field:', requestData.text);
  console.log('  - content field:', requestData.content);
  console.log('  - All available fields:', Object.keys(requestData));
  
  console.log('Extracted textContent:', textContent);
  console.log('textContent type:', typeof textContent);
  console.log('textContent length:', textContent?.length || 0);
  console.log('textContent trimmed length:', textContent?.trim()?.length || 0);
  console.log('textContent first 100 chars:', textContent?.substring(0, 100));
  
  // New validation logic
  if (!textContent || textContent.trim().length < 50) {
    console.log('❌ VALIDATION FAILED IN V3.0:');
    console.log('  - textContent exists:', !!textContent);
    console.log('  - textContent length:', textContent?.length || 0);
    console.log('  - textContent trimmed length:', textContent?.trim()?.length || 0);
    
    return res.status(400).json({ 
      error: "V3.0 VALIDATION ERROR: Text content must be at least 50 characters long",
      code: "V3_TEXT_TOO_SHORT",
      receivedLength: textContent?.length || 0,
      requiredLength: 50,
      version: "3.0",
      timestamp: new Date().toISOString()
    });
  }

  // Success response with new format
  res.json({
    success: true,
    message: "V3.0 Quiz generation working!",
    version: "3.0",
    receivedLength: textContent.length,
    questionCount,
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
console.log('🚀 NEW FUNCTION V3.0 LOADED at:', new Date().toISOString());
console.log('FUNCTION VERSION: QUIZ-API-v3.0-COMPLETE-REWRITE');
console.log('This is a COMPLETELY NEW function to force Netlify rebuild');
console.log('All endpoints have been rewritten with new logic');
