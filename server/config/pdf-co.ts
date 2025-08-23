export const PDF_CO_CONFIG = {
  API_KEY: process.env.PDF_CO_API_KEY || "aryansinghjadaun@gmail.com_IR4ErjQrrR9cMHVIfwd5APD4v08CgP1dEYCvfQiZRlKr3SfWNLxwzfnHxsEYrizY",
  API_URL: "https://api.pdf.co/v1/pdf/convert/to/text",
  TIMEOUT: 60000, // 60 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};

export const validatePDFCoConfig = () => {
  if (!PDF_CO_CONFIG.API_KEY) {
    throw new Error('PDF.co API key is required. Please set PDF_CO_API_KEY environment variable.');
  }
  
  if (!PDF_CO_CONFIG.API_KEY.includes('_')) {
    throw new Error('Invalid PDF.co API key format. Please check your API key.');
  }
  
  return true;
};
