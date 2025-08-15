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

// Quiz generation endpoint
app.post("/api/generate-quiz", async (req, res) => {
  console.log('=== QUIZ GENERATION REQUEST START ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { textContent, questionCount = 20 } = req.body;
  
  console.log('Received textContent length:', textContent?.length || 0);
  
  if (!textContent || textContent.trim().length < 50) {
    return res.status(400).json({ error: "Text content must be at least 50 characters long" });
  }

  // Return success response
  res.json({
    success: true,
    message: "Quiz generation working!",
    receivedLength: textContent.length,
    questionCount
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
