const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");

// Create the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong - working!" });
});

// Test endpoint to verify function is working
app.post("/api/test", (req, res) => {
  console.log('=== TEST ENDPOINT ===');
  console.log('Request body:', req.body);
  console.log('Request body type:', typeof req.body);
  console.log('Request body keys:', Object.keys(req.body || {}));
  
  res.json({ 
    message: "Test endpoint working!",
    receivedBody: req.body,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body || {}),
    timestamp: new Date().toISOString()
  });
});

// Quiz generation endpoint
app.post("/api/generate-quiz", async (req, res) => {
  console.log('=== QUIZ GENERATION REQUEST START ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request body type:', typeof req.body);
  console.log('Request body keys:', Object.keys(req.body || {}));
  
  const { textContent, questionCount = 20 } = req.body;
  
  console.log('Extracted textContent:', textContent);
  console.log('textContent type:', typeof textContent);
  console.log('textContent length:', textContent?.length || 0);
  console.log('textContent trimmed length:', textContent?.trim()?.length || 0);
  console.log('textContent first 100 chars:', textContent?.substring(0, 100));
  
  if (!textContent || textContent.trim().length < 50) {
    console.log('❌ VALIDATION FAILED:');
    console.log('  - textContent exists:', !!textContent);
    console.log('  - textContent length:', textContent?.length || 0);
    console.log('  - textContent trimmed length:', textContent?.trim()?.length || 0);
    return res.status(400).json({ 
      error: "VALIDATION ERROR: Text content must be at least 50 characters long",
      code: "TEXT_TOO_SHORT",
      receivedLength: textContent?.length || 0,
      requiredLength: 50,
      timestamp: new Date().toISOString()
    });
  }

  // Return success response
  res.json({
    success: true,
    message: "Quiz generation working! - UPDATED VERSION",
    receivedLength: textContent.length,
    questionCount,
    timestamp: new Date().toISOString()
  });
});

// PDF processing endpoint
app.post("/api/process-pdf", async (req, res) => {
  res.json({
    success: false,
    message: "Use client-side PDF processing"
  });
});

// Export the serverless handler
module.exports.handler = serverless(app);

// Force Netlify to recognize this as a new function
console.log('Function loaded at:', new Date().toISOString());
console.log('FUNCTION VERSION: QUIZ-API-v2.0');
console.log('This is a completely new function to force Netlify rebuild');
