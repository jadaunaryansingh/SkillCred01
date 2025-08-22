// Development startup script for Quiz Maker with PDF.co API
// This script starts both the Vite client server and Express server

import { spawn } from 'child_process';
import { createServer } from './server/index.js';
import express from 'express';

console.log('🚀 Starting Quiz Maker development servers...\n');

// Start Express server
const app = createServer();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`);
  console.log(`📄 PDF.co API endpoint: http://localhost:${PORT}/api/process-pdf-co`);
  console.log(`📄 Regular PDF endpoint: http://localhost:${PORT}/api/process-pdf`);
  console.log(`🧪 Demo endpoint: http://localhost:${PORT}/api/demo`);
  console.log(`🎯 Quiz generation: http://localhost:${PORT}/api/generate-quiz\n`);
});

// Start Vite client server
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (error) => {
  console.error('❌ Error starting Vite server:', error);
});

viteProcess.on('close', (code) => {
  console.log(`\n🔄 Vite server exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  viteProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development servers...');
  viteProcess.kill();
  process.exit(0);
});

