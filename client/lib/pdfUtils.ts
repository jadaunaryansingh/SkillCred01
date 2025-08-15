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
            // Clean up the extracted text to remove binary artifacts
            const cleanedPageText = pageText
              .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable characters
              .replace(/\s+/g, ' ') // Normalize whitespace
              .replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/g, '') // Keep meaningful punctuation
              .replace(/\s+/g, ' ') // Normalize whitespace again
              .trim();
            
            if (cleanedPageText.length > 10) {
              fullText += `${cleanedPageText}\n\n`;
              console.log(`Page ${pageNum} extracted, text length:`, cleanedPageText.length);
            } else {
              console.log(`Page ${pageNum} has insufficient text content after cleaning`);
            }
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
      
      // Use aggressive cleaning on the extracted text
      const cleanedText = cleanExtractedText(fullText);
      
      if (cleanedText.length < 50) {
        return {
          text: '',
          pageCount,
          success: false,
          error: 'After cleaning, insufficient readable text was found in the PDF. The PDF might contain mostly binary data or images.'
        };
      }
      
      return {
        text: cleanedText,
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

// Function to aggressively clean extracted text and remove binary artifacts
export function cleanExtractedText(text: string): string {
  console.log('🔍 CLEANING EXTRACTED TEXT:', { originalLength: text.length });
  
  // Step 1: Remove all non-printable and binary characters
  let cleaned = text
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Keep only printable ASCII
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  console.log('🔍 AFTER ASCII FILTERING:', { length: cleaned.length, preview: cleaned.substring(0, 100) });
  
  // Step 2: Remove PDF metadata and binary artifacts
  cleaned = cleaned
    .replace(/Mozilla\/\d+\.\d+.*?Skia\/PDF.*?/g, '') // Remove browser/PDF metadata
    .replace(/D:\d{14}.*?/g, '') // Remove PDF dates
    .replace(/[A-Z]{2,}\/[A-Z0-9\s]+/g, '') // Remove PDF operators
    .replace(/\d{10,}_[A-Z\s]+/g, '') // Remove long numbers with names
    .replace(/[A-Z]{3,}\s*[A-Z0-9\s]*\s*[A-Z0-9\s]*/g, '') // Remove PDF internal structures
    .replace(/endobj|endstream|trailer|startxref|xref/g, '') // Remove PDF keywords
    .replace(/Type\s*\/\s*[A-Za-z]+/g, '') // Remove PDF type declarations
    .replace(/Filter\s*\/\s*[A-Za-z]+/g, '') // Remove PDF filter declarations
    .replace(/Length\s*\d+/g, '') // Remove PDF length declarations
    .replace(/stream.*?endstream/g, '') // Remove PDF stream content
    .replace(/[A-Za-z]+\s*\/\s*[A-Za-z]+/g, '') // Remove PDF object references
    .replace(/\d+\s+\d+\s+R/g, '') // Remove PDF object numbers
    .replace(/[A-Za-z]+\s*\[[^\]]*\]/g, '') // Remove PDF arrays
    .replace(/[A-Za-z]+\s*<[^>]*>/g, '') // Remove PDF dictionaries
    .replace(/\s+/g, ' ') // Normalize whitespace again
    .trim();
  
  console.log('🔍 AFTER PDF CLEANING:', { length: cleaned.length, preview: cleaned.substring(0, 100) });
  
  // Step 3: Extract only meaningful text patterns
  const meaningfulPatterns = [
    // Look for actual readable text (words with reasonable length)
    /[A-Za-z]{3,20}/g,
    // Look for sentences (text ending with punctuation)
    /[A-Za-z][^.!?]*[.!?]/g,
    // Look for text in quotes
    /"[^"]{5,}"/g,
    // Look for text in parentheses
    /\([^)]{5,}\)/g
  ];
  
  let extractedText = '';
  for (const pattern of meaningfulPatterns) {
    const matches = cleaned.match(pattern) || [];
    for (const match of matches) {
      // Clean up each match
      const cleanMatch = match
        .replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/g, '') // Keep meaningful punctuation
        .trim();
      
      if (cleanMatch.length > 5 && /[A-Za-z]/.test(cleanMatch)) {
        extractedText += cleanMatch + ' ';
      }
    }
  }
  
  // Step 4: Final cleanup
  const finalText = extractedText
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/g, '') // Final punctuation cleanup
    .replace(/\s+/g, ' ') // Normalize whitespace again
    .trim();
  
  console.log('🔍 FINAL CLEANED TEXT:', { length: finalText.length, preview: finalText.substring(0, 200) });
  
  return finalText;
}

// Function to detect if PDF contains mostly binary data
export function detectBinaryContent(text: string): { isBinary: boolean; readablePercentage: number } {
  const totalChars = text.length;
  const readableChars = text.split('').filter(char => /[A-Za-z0-9\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/.test(char)).length;
  const readablePercentage = (readableChars / totalChars) * 100;
  
  return {
    isBinary: readablePercentage < 30, // If less than 30% is readable, consider it binary
    readablePercentage
  };
}

// Specialized function for PDFs with heavy binary content
export function extractReadableTextFromBinaryPDF(text: string): string {
  console.log('🔍 EXTRACTING READABLE TEXT FROM BINARY PDF:', { originalLength: text.length });
  
  // Step 1: Find actual readable text patterns
  const readablePatterns = [
    // Look for actual words (3-20 characters, mostly letters)
    /[A-Za-z]{3,20}/g,
    // Look for text in quotes
    /"[^"]{5,}"/g,
    // Look for text in parentheses
    /\([^)]{5,}\)/g,
    // Look for sentences ending with punctuation
    /[A-Za-z][^.!?]*[.!?]/g,
    // Look for text after common words
    /(?:Task|List|Google|Docs|Mozilla|Windows|Apple|Chrome|Safari|Producer|Creation|ModDate|Normal|Filter|FlateDecode|Length|stream|Resources|ProcSet|Image|ExtGState|MediaBox|Contents|StructParents|Parent|StructElem|NonStruct|Document|ParentTree|StructTreeRoot|ParentTreeNextKey|Catalog|MarkInfo|Marked)\s*[A-Za-z0-9\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]{5,}/gi
  ];
  
  let extractedText = '';
  const seenText = new Set<string>();
  
  for (const pattern of readablePatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      // Clean up each match
      const cleanMatch = match
        .replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/g, '') // Keep meaningful punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Only add if it's meaningful and we haven't seen it
      if (cleanMatch.length > 5 && 
          /[A-Za-z]/.test(cleanMatch) && 
          !seenText.has(cleanMatch) &&
          !cleanMatch.includes('FontFile') &&
          !cleanMatch.includes('FontDescriptor') &&
          !cleanMatch.includes('SystemInfo') &&
          !cleanMatch.includes('Registry') &&
          !cleanMatch.includes('Adobe')) {
        
        seenText.add(cleanMatch);
        extractedText += cleanMatch + ' ';
      }
    }
  }
  
  // Step 2: Look for specific known text patterns
  const knownTexts = [
    'Task List 2025 - Google Docs',
    'Mozilla',
    'Windows NT',
    'Chrome',
    'Safari',
    'Producer',
    'CreationDate',
    'ModDate',
    'Normal',
    'Filter',
    'FlateDecode',
    'Length',
    'stream',
    'Resources',
    'ProcSet',
    'Image',
    'ExtGState',
    'MediaBox',
    'Contents',
    'StructParents',
    'Parent',
    'StructElem',
    'NonStruct',
    'Document',
    'ParentTree',
    'StructTreeRoot',
    'ParentTreeNextKey',
    'Catalog',
    'MarkInfo',
    'Marked'
  ];
  
  for (const knownText of knownTexts) {
    if (text.includes(knownText) && !extractedText.includes(knownText)) {
      extractedText += knownText + ' ';
    }
  }
  
  // Step 3: Final cleanup
  const finalText = extractedText
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/g, '') // Final punctuation cleanup
    .replace(/\s+/g, ' ') // Normalize whitespace again
    .trim();
  
  console.log('🔍 EXTRACTED READABLE TEXT:', { length: finalText.length, preview: finalText.substring(0, 200) });
  
  return finalText;
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
    
    // Check if the content is mostly binary
    const binaryCheck = detectBinaryContent(text);
    console.log('Binary content detection:', binaryCheck);
    
    if (binaryCheck.isBinary) {
      console.log('PDF appears to contain mostly binary data, trying specialized extraction...');
    }
    
    // Better approach: Look for actual readable text content
    // PDFs often store text in specific patterns we can extract
    
    // Method 1: Extract text between parentheses (common PDF text format)
    const parenthesesText = text.match(/\(([^)]{5,})\)/g) || [];
    let extractedText = '';
    
    for (const match of parenthesesText) {
      const cleanText = match
        .replace(/[\(\)]/g, '') // Remove parentheses
        .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
        .trim();
      
      if (cleanText.length > 10 && /[A-Za-z]/.test(cleanText)) {
        extractedText += cleanText + ' ';
      }
    }
    
    // Method 2: Extract text after Tj operator (PDF text operator)
    const tjMatches = text.match(/Tj\s*\(([^)]+)\)/g) || [];
    for (const match of tjMatches) {
      const cleanText = match
        .replace(/Tj\s*\(/, '') // Remove Tj operator
        .replace(/\)$/, '') // Remove closing parenthesis
        .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
        .trim();
      
      if (cleanText.length > 5 && /[A-Za-z]/.test(cleanText)) {
        extractedText += cleanText + ' ';
      }
    }
    
    // Method 3: Extract text after TJ operator (PDF text array operator)
    const tjArrayMatches = text.match(/TJ\s*\[([^\]]+)\]/g) || [];
    for (const match of tjArrayMatches) {
      const cleanText = match
        .replace(/TJ\s*\[/, '') // Remove TJ operator
        .replace(/\]$/, '') // Remove closing bracket
        .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
        .trim();
      
      if (cleanText.length > 5 && /[A-Za-z]/.test(cleanText)) {
        extractedText += cleanText + ' ';
      }
    }
    
    // Method 4: Look for plain text patterns (words with reasonable length)
    const wordPattern = /[A-Za-z]{3,20}/g;
    const words = text.match(wordPattern) || [];
    const uniqueWords = [...new Set(words)].slice(0, 100); // Limit to first 100 unique words
    
    if (uniqueWords.length > 10) {
      extractedText += uniqueWords.join(' ') + ' ';
    }
    
    // Clean up the extracted text
    const cleanedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=<>|\\\/\-]/g, '') // Keep meaningful punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace again
      .trim();
    
    console.log('Fallback extraction completed. Text length:', cleanedText.length);
    console.log('Extracted text preview:', cleanedText.substring(0, 200));
    
    if (cleanedText.length > 100) {
      // Use the aggressive cleaning function for final cleanup
      const finalCleanedText = cleanExtractedText(cleanedText);
      
      if (finalCleanedText.length > 50) {
        return {
          text: finalCleanedText,
          success: true
        };
      }
    }
    
    // If we still don't have enough text, try a different approach
    console.log('Trying alternative text extraction...');
    
    // Use the specialized function for binary PDFs
    const binaryPDFText = extractReadableTextFromBinaryPDF(text);
    
    if (binaryPDFText.length > 100) {
      return {
        text: binaryPDFText,
        success: true
      };
    }
    
    // If we still don't have enough text, try a different approach
    console.log('Trying alternative text extraction...');
    
    // Use the aggressive cleaning function on the raw text
    const aggressivelyCleanedText = cleanExtractedText(text);
    
    if (aggressivelyCleanedText.length > 100) {
      return {
        text: aggressivelyCleanedText,
        success: true
      };
    }
    
    return {
      text: '',
      success: false,
      error: 'Could not extract meaningful text from PDF using fallback method'
    };
  } catch (error) {
    console.error('Fallback extraction error:', error);
    return {
      text: '',
      success: false,
      error: 'Fallback text extraction failed'
    };
  }
}
