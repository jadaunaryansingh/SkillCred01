import serverless from "serverless-http";
import express from "express";
import cors from "cors";

// Create the Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// Quiz generation endpoint
app.post("/api/generate-quiz", async (req, res) => {
  console.log('=== QUIZ GENERATION REQUEST START ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', req.headers);
  
  const { textContent, questionCount = 20 } = req.body;
  
  console.log('Extracted data:', {
    textContentLength: textContent?.length || 0,
    questionCount,
    hasTextContent: !!textContent,
    textContentType: typeof textContent,
    textContentIsString: typeof textContent === 'string',
    textContentIsEmpty: textContent === '',
    textContentIsNull: textContent === null,
    textContentIsUndefined: textContent === undefined
  });
  
  if (!textContent) {
    console.log('❌ textContent is falsy, returning error');
    return res.status(400).json({ error: "Text content is required" });
  }

  // Additional validation for text content
  if (typeof textContent !== 'string') {
    return res.status(400).json({ error: "Text content must be a string" });
  }

  if (textContent.trim().length < 100) {
    return res.status(400).json({ error: "Text content must be at least 100 characters long" });
  }

  // Clean the text content on the server side as well
  const cleanedTextContent = textContent
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (cleanedTextContent.length < 100) {
    return res.status(400).json({ error: "After cleaning, text content is too short. Please provide more substantial content." });
  }

  console.log('Cleaned text content length:', cleanedTextContent.length);

  try {
    // For now, return a simple response to test the endpoint
    res.json({
      success: true,
      message: "Quiz generation endpoint working!",
      receivedContentLength: textContent.length,
      cleanedContentLength: cleanedTextContent.length,
      questionCount
    });
  } catch (error) {
    console.error("Error in quiz generation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Export the serverless handler
export const handler = serverless(app);
