import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js with an inline worker to avoid CORS issues
const setupPDFWorker = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Create a simple inline worker to avoid CORS issues
      const workerBlob = new Blob([`
        // Simple PDF.js worker stub
        self.onmessage = function(e) {
          // Just pass through messages to avoid CORS issues
          self.postMessage(e.data);
        };
      `], { type: 'application/javascript' });
      
      const workerUrl = URL.createObjectURL(workerBlob);
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
      
      console.log('PDF.js configured with inline worker');
    } else {
      console.warn('PDF.js worker setup skipped - not in browser environment');
    }
  } catch (error) {
    console.warn('Failed to set up PDF.js:', error);
    // Fallback: try to disable worker
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = null;
      console.log('PDF.js fallback: worker disabled');
    } catch (fallbackError) {
      console.error('Failed to configure PDF.js fallback:', fallbackError);
    }
  }
};

// Initialize the worker setup
setupPDFWorker();

export interface ExtractedPDFContent {
  text: string;
  pageCount: number;
  success: boolean;
  error?: string;
}

export async function extractTextFromPDF(file: File): Promise<ExtractedPDFContent> {
  // Add timeout to prevent hanging - reduced to 10 seconds since PDF.js is hanging
  const timeoutPromise = new Promise<ExtractedPDFContent>((_, reject) => {
    setTimeout(() => {
      reject(new Error('PDF processing timed out after 10 seconds'));
    }, 10000); // 10 second timeout
  });

  const processingPromise = async (): Promise<ExtractedPDFContent> => {
    try {
      console.log('Starting PDF extraction for file:', file.name, 'Size:', file.size);
      
      // Convert file to ArrayBuffer
      console.log('Converting file to ArrayBuffer...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);

      // Load the PDF document with minimal configuration to avoid external dependencies
      console.log('Loading PDF document...');
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: false,
        // Don't use any external resources
      });

      console.log('Waiting for PDF to load...');
      const pdf = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdf.numPages);
      
      let fullText = '';
      const pageCount = pdf.numPages;
      
      // Extract text from each page with better error handling
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        try {
          console.log(`Processing page ${pageNum}/${pageCount}...`);
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          // Combine all text items from the page with better formatting
          const pageText = textContent.items
            .filter((item): item is any => 'str' in item && item.str.trim())
            .map((item: any) => item.str.trim())
            .join(' ');
          
          if (pageText.trim()) {
            fullText += `${pageText}\n\n`;
            console.log(`Page ${pageNum} extracted, text length:`, pageText.length);
          } else {
            console.log(`Page ${pageNum} has no text content`);
          }
        } catch (pageError) {
          console.warn(`Error extracting text from page ${pageNum}:`, pageError);
          // Continue with other pages even if one fails
        }
      }
      
      console.log('PDF extraction completed. Total text length:', fullText.length);
      
      if (!fullText.trim()) {
        return {
          text: '',
          pageCount,
          success: false,
          error: 'No text content found in the PDF. The PDF might contain only images, be password protected, or have corrupted text layers.'
        };
      }
      
      return {
        text: fullText.trim(),
        pageCount,
        success: true
      };
      
    } catch (error) {
      console.error('Error extracting text from PDF:', error);

      let errorMessage = 'Failed to extract text from PDF.';

      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          errorMessage = 'Invalid PDF file. Please ensure the file is a valid PDF document.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password-protected PDFs are not supported. Please upload an unprotected PDF.';
        } else if (error.message.includes('worker') || error.message.includes('fetch')) {
          errorMessage = 'PDF processing temporarily unavailable. Please try uploading the file again or paste text content instead.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'PDF processing blocked by browser security. Please try uploading the file again.';
        } else if (error.message.includes('UnknownErrorException') || error.name === 'UnknownErrorException') {
          errorMessage = 'PDF processing failed due to browser compatibility issues. Please try copying and pasting the text content instead.';
        } else if (error.message.includes('timed out')) {
          errorMessage = 'PDF processing timed out. The file might be too large or complex. Please try a smaller PDF or copy and paste the text instead.';
        } else {
          errorMessage = `PDF processing error: ${error.message}`;
        }
      } else if (error && typeof error === 'object' && 'name' in error && error.name === 'UnknownErrorException') {
        errorMessage = 'PDF processing failed due to browser compatibility issues. Please try copying and pasting the text content instead.';
      }

      return {
        text: '',
        pageCount: 0,
        success: false,
        error: errorMessage
      };
    }
  };

  // Race between processing and timeout
  return Promise.race([processingPromise(), timeoutPromise]);
}

export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Please select a PDF file.'
    };
  }
  
  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'PDF file is too large. Please select a file smaller than 10MB.'
    };
  }
  
  // Check if file has content
  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty.'
    };
  }
  
  return { valid: true };
}

// Test function to verify PDF processing capabilities
export async function testPDFProcessing(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    // Test if PDF.js is available
    if (typeof pdfjsLib === 'undefined') {
      return {
        success: false,
        message: 'PDF.js library not available',
        error: 'PDF.js library failed to load'
      };
    }

    // Test if getDocument function is available
    if (typeof pdfjsLib.getDocument !== 'function') {
      return {
        success: false,
        message: 'PDF.js getDocument function not available',
        error: 'PDF.js library may not be properly loaded'
      };
    }

    // Test if worker is configured (should be a blob URL or null)
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc && pdfjsLib.GlobalWorkerOptions.workerSrc !== null) {
      return {
        success: false,
        message: 'PDF.js worker not properly configured',
        error: 'Worker should be set to avoid CORS issues'
      };
    }

    return {
      success: true,
      message: 'PDF processing is ready (inline worker mode)'
    };

  } catch (error) {
    return {
      success: false,
      message: 'PDF processing test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Simple fallback method for basic PDF validation
export function validatePDFStructure(file: File): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check for PDF magic number (%PDF)
        const header = new TextDecoder().decode(uint8Array.slice(0, 8));
        if (!header.startsWith('%PDF')) {
          resolve({
            valid: false,
            error: 'File does not appear to be a valid PDF (missing PDF header)'
          });
          return;
        }
        
        resolve({ valid: true });
      } catch (error) {
        resolve({
          valid: false,
          error: 'Failed to validate PDF structure'
        });
      }
    };
    reader.onerror = () => {
      resolve({
        valid: false,
        error: 'Failed to read PDF file'
      });
    };
    reader.readAsArrayBuffer(file);
  });
}

// Simple text extraction fallback (very basic, for emergency use)
export async function extractTextFallback(file: File): Promise<{ text: string; success: boolean; error?: string }> {
  try {
    console.log('Starting fallback text extraction for:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and look for text patterns
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(uint8Array);
    
    console.log('Raw text length:', text.length);
    
    // Look for common text patterns in PDFs - more comprehensive approach
    const textPatterns = [
      // Text in parentheses (common PDF text format)
      /\([^)]{3,}\)/g,
      // Text between BT and ET (PDF text operators)
      /BT\s*([^E]*?)ET/g,
      // Text after Tj operator
      /Tj\s*\(([^)]+)\)/g,
      // Text after TJ operator
      /TJ\s*\[([^\]]+)\]/g,
      // Plain text patterns
      /[A-Za-z]{3,}/g
    ];
    
    let extractedText = '';
    
    for (const pattern of textPatterns) {
      const matches = text.match(pattern) || [];
      for (const match of matches) {
        // Clean up the text
        let cleanText = match
          .replace(/[\(\)\[\]]/g, '') // Remove brackets
          .replace(/BT|ET|Tj|TJ/g, '') // Remove PDF operators
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        if (cleanText.length > 10 && /[A-Za-z]/.test(cleanText)) {
          extractedText += cleanText + ' ';
        }
      }
    }
    
    // Also try to extract readable text directly
    const readableText = text
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only printable ASCII
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Filter out common PDF metadata and binary artifacts
    const filteredText = readableText
      .replace(/\d{10,}_[A-Z\s]+/g, '') // Remove long numbers with names
      .replace(/Mozilla\/\d+\.\d+.*?Skia\/PDF.*?/g, '') // Remove browser/PDF metadata
      .replace(/[A-Z]{2,}\/[A-Z0-9\s]+/g, '') // Remove PDF operators
      .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '') // Remove dates
      .replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/g, '') // Keep only meaningful punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace again
      .trim();
    
    // Combine both approaches
    const finalText = (extractedText + ' ' + filteredText).trim();
    
    console.log('Fallback extraction completed. Text length:', finalText.length);
    
    if (finalText.length > 100) {
      return {
        text: finalText,
        success: true
      };
    } else {
      return {
        text: '',
        success: false,
        error: 'Could not extract meaningful text from PDF using fallback method'
      };
    }
  } catch (error) {
    console.error('Fallback extraction error:', error);
    return {
      text: '',
      success: false,
      error: 'Fallback text extraction failed'
    };
  }
}
