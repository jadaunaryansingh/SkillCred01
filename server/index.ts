import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGenerateQuiz } from "./routes/generate-quiz";
import { handlePDFUpload, handlePDFProcessing } from "./routes/process-pdf";
import { handlePDFUpload as handlePDFCoUpload, handlePDFCoProcessing } from "./routes/pdf-co-api";

export function createServer() {
  const app = express();

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
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/generate-quiz", handleGenerateQuiz);
  
  // PDF upload route - no body parsing middleware applied
  app.post("/api/process-pdf", handlePDFUpload, handlePDFProcessing);
  
  // PDF.co API route for enhanced PDF processing
  app.post("/api/process-pdf-co", handlePDFCoUpload, handlePDFCoProcessing);

  return app;
}

// Start the server if this file is run directly
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  const app = createServer();
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Available endpoints:`);
    console.log(`   GET  /api/ping - Health check`);
    console.log(`   GET  /api/demo - Demo endpoint`);
    console.log(`   POST /api/generate-quiz - Quiz generation`);
    console.log(`   POST /api/process-pdf - PDF processing`);
    console.log(`   POST /api/process-pdf-co - PDF.co API processing`);
  });
}
