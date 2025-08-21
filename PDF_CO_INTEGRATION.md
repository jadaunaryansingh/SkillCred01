# PDF.co API Integration

This project now includes integration with the PDF.co API for enhanced PDF text extraction capabilities.

## Features

- **High-quality PDF text extraction** using PDF.co's advanced OCR and text recognition
- **Support for complex PDFs** including scanned documents, forms, and multi-page documents
- **Fast processing** with cloud-based API
- **Fallback support** to existing PDF processing methods

## API Endpoints

### New PDF.co API Endpoint
```
POST /api/process-pdf-co
```

This endpoint uses the PDF.co API for enhanced PDF processing.

### Existing PDF Endpoint
```
POST /api/process-pdf
```

This endpoint uses the existing PDF processing method as a fallback.

## Configuration

### Environment Variables

Create a `.env` file in your project root with:

```bash
# PDF.co API Configuration
PDF_CO_API_KEY=aryansinghjadaun@gmail.com_7dmpkxzURrYaZLWJnIX0JifPWgwuaUWKz9Wil5jJTimo00JifPWgwuaUWKz9Wil5jJTimo00jmuc1W3trfJtZ8IkuJ

# Other environment variables
PING_MESSAGE=ping
```

### API Key

The current API key is hardcoded as a fallback, but it's recommended to use environment variables for production:

- **Current Key**: `aryansinghjadaun@gmail.com_7dmpkxzURrYaZLWJnIX0JifPWgwuaUWKz9Wil5jJTimo00jmuc1W3trfJtZ8IkuJ`
- **Environment Variable**: `PDF_CO_API_KEY`

## Usage

### Frontend Integration

To use the new PDF.co API endpoint, update your frontend code to call `/api/process-pdf-co` instead of `/api/process-pdf`.

### Request Format

```javascript
const formData = new FormData();
formData.append('pdf', pdfFile);

const response = await fetch('/api/process-pdf-co', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  const extractedText = result.textContent;
  // Use the extracted text for quiz generation
}
```

### Response Format

```typescript
interface PDFUploadResponse {
  success: boolean;
  textContent?: string;
  message: string;
  error?: string;
}
```

## Benefits of PDF.co API

1. **Better Text Extraction**: Superior OCR capabilities for scanned documents
2. **Form Processing**: Can extract text from PDF forms and tables
3. **Multi-language Support**: Handles various languages and character sets
4. **Cloud Processing**: No local resource usage
5. **Reliability**: Professional-grade API with high uptime

## Error Handling

The API includes comprehensive error handling for:
- Invalid PDF files
- API key issues
- Network timeouts
- PDF.co API errors
- File size limits (10MB max)

## Rate Limits

- PDF.co API has rate limits based on your plan
- Current configuration includes 60-second timeout
- File size limit: 10MB per upload

## Security

- API key is stored in environment variables
- File uploads are validated for PDF type
- No files are permanently stored on the server
- All processing is done through secure HTTPS

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Check your PDF.co API key format
2. **File Too Large**: Ensure PDF is under 10MB
3. **Timeout Errors**: Large PDFs may take longer to process
4. **Invalid File Type**: Only PDF files are accepted

### Debug Mode

Enable debug logging by checking the server console for detailed error messages and processing information.
