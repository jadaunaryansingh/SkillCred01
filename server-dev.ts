// Simple Express server for development testing
// Run with: npm run dev:api

import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./server/routes/demo";
import { handleGenerateQuiz } from "./server/routes/generate-quiz";
import { handlePDFUpload, handlePDFProcessing } from "./server/routes/process-pdf";
import { handlePDFUpload as handlePDFCoUpload, handlePDFCoProcessing } from "./server/routes/pdf-co-api";
import { handleGeminiPDFProcessing, handlePDFUpload as handleGeminiPDFUpload } from "./server/routes/gemini-pdf";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Apply JSON parsing only to specific routes that need it
app.use('/api/generate-quiz', express.json({ limit: '10mb' }));
app.use('/api/demo', express.json({ limit: '10mb' }));

// Apply URL encoding to routes that might need it
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Example API routes
app.get("/api/ping", (_req, res) => {
  const ping = process.env.PING_MESSAGE ?? "ping";
  res.json({ message: "ping pong" });
});

app.get("/api/demo", handleDemo);
app.post("/api/generate-quiz", handleGenerateQuiz);

// PDF upload route - no body parsing middleware applied
app.post("/api/process-pdf", handlePDFUpload, handlePDFProcessing);

// PDF.co API route for enhanced PDF processing
app.post("/api/process-pdf-co", handlePDFCoUpload, handlePDFCoProcessing);

// Gemini AI route for direct PDF processing
app.post("/api/process-pdf-gemini", handleGeminiPDFUpload, handleGeminiPDFProcessing);

app.listen(PORT, () => {
  console.log('🚀 Quiz Maker Express Server Started!');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('\n📄 Available API Endpoints:');
  console.log(`   POST /api/process-pdf-gemini - Gemini AI PDF processing`);
  console.log(`   POST /api/process-pdf-co    - PDF.co API processing`);
  console.log(`   POST /api/process-pdf       - Regular PDF processing`);
  console.log(`   POST /api/generate-quiz     - Quiz generation`);
  console.log(`   GET  /api/demo             - Demo endpoint`);
  console.log(`   GET  /api/ping             - Health check`);
  console.log('\n🔑 PDF.co API Key Status: Configured and ready');
  console.log('💡 To test PDF processing, upload a PDF to /api/process-pdf-co');
  console.log('\nPress Ctrl+C to stop the server');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

