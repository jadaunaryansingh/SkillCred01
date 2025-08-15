export interface DemoResponse {
  message: string;
}

export interface QuizQuestion {
  id: number;
  type: "multiple-choice" | "true-false";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface QuizGenerationRequest {
  textContent: string;
  questionCount?: number;
}

export interface QuizGenerationResponse {
  success: boolean;
  quiz?: Quiz;
  message: string;
  error?: string;
}

export interface PDFUploadResponse {
  success: boolean;
  textContent?: string;
  message: string;
  error?: string;
}
