// Simple Express server for development testing
// Run with: npm run dev:api

import { createServer } from './server/index.js';

const app = createServer();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('🚀 Quiz Maker Express Server Started!');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log('\n📄 Available API Endpoints:');
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

