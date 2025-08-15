import React, { useState, useRef } from "react";
import { Upload, FileText, Brain, Download, Sparkles, BookOpen, Info, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { QuizGenerationResponse, QuizQuestion, PDFUploadResponse } from "@shared/api";
import { AuthModal, UserMenu } from "@/components/AuthComponents";
import QuizViewer from "@/components/QuizViewer";
import { extractTextFromPDF, validatePDFFile, testPDFProcessing, validatePDFStructure, extractTextFallback } from "@/lib/pdfUtils";

export default function Index() {
  const [textContent, setTextContent] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [pdfTestResult, setPdfTestResult] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check authentication on component mount
  React.useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  // Test PDF processing when debug mode is enabled
  React.useEffect(() => {
    if (debugMode) {
      testPDFProcessing().then(result => {
        setPdfTestResult(result.success ? result.message : `Error: ${result.error}`);
        if (debugMode) {
          console.log('PDF Processing Test Result:', result);
        }
      });
    }
  }, [debugMode]);

  // Debug: Monitor textContent state changes
  React.useEffect(() => {
    console.log('textContent state changed to:', textContent?.length || 0, 'characters');
  }, [textContent]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload PDFs and generate quizzes.",
        variant: "destructive",
      });
      setShowAuthModal(true);
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    // Validate PDF file
    const validation = validatePDFFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error || "Please select a valid PDF file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      if (debugMode) {
        console.log('PDF Upload Debug:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          lastModified: new Date(file.lastModified).toISOString()
        });
      }

      // Try server-side processing first
      const formData = new FormData();
      formData.append('pdf', file);

      if (debugMode) {
        console.log('Attempting server-side PDF processing...');
      }

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (debugMode) {
        console.log('Server response status:', response.status);
        console.log('Server response headers:', Object.fromEntries(response.headers.entries()));
      }

      const result: PDFUploadResponse = await response.json();

      if (debugMode) {
        console.log('Server response result:', result);
      }

      if (result.success && result.textContent) {
        setTextContent(result.textContent);
        toast({
          title: "PDF processed successfully",
          description: result.message || "Text extracted and ready for quiz generation.",
        });
      } else {
        // Fallback to client-side processing
        console.log("Server-side PDF processing failed, trying fallback method...");
        
        // Try fallback method first since PDF.js is hanging
        const fallbackResult = await extractTextFallback(file);
        
        if (fallbackResult.success) {
          console.log('Setting textContent from fallback (first):', fallbackResult.text.length, 'characters');
          setTextContent(fallbackResult.text);
          console.log('textContent state should now be set to:', fallbackResult.text.length, 'characters');
          toast({
            title: "PDF processed (fallback method)",
            description: `Extracted ${fallbackResult.text.length} characters using fallback method.`,
          });
        } else {
          toast({
            title: "PDF processing failed",
            description: result.error || fallbackResult.error || "Failed to extract text from PDF. Please try copying and pasting the text instead.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("PDF upload error:", error);
      
      // Try client-side fallback if server request fails
      try {
        console.log("Server request failed, trying client-side fallback...");
        
        // First validate the PDF structure
        const structureValidation = await validatePDFStructure(file);
        if (!structureValidation.valid) {
          toast({
            title: "Invalid PDF file",
            description: structureValidation.error || "The file does not appear to be a valid PDF.",
            variant: "destructive",
          });
          return;
        }
        
        // Try fallback method directly since PDF.js is hanging
        console.log("Trying fallback text extraction...");
        const fallbackResult = await extractTextFallback(file);
        
        if (fallbackResult.success) {
          setTextContent(fallbackResult.text);
          toast({
            title: "PDF processed (fallback method)",
            description: `Extracted ${fallbackResult.text.length} characters using fallback method.`,
          });
        } else {
          toast({
            title: "PDF processing failed",
            description: fallbackResult.error || "Failed to extract text from PDF. Please try copying and pasting the text instead.",
            variant: "destructive",
          });
        }
      } catch (clientError) {
        console.error("Client-side PDF processing also failed:", clientError);
        toast({
          title: "Upload failed",
          description: "Both server and client-side PDF processing failed. Please try copying and pasting the text content instead.",
          variant: "destructive",
        });
      }
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };


  const generateQuiz = async () => {
    // Check authentication first
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate quizzes.",
        variant: "destructive",
      });
      setShowAuthModal(true);
      return;
    }

    console.log('generateQuiz called with textContent length:', textContent?.length || 0);
    console.log('textContent preview:', textContent?.substring(0, 100));

    if (!textContent.trim()) {
      toast({
        title: "No content",
        description: "Please upload a PDF or enter text content first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textContent, questionCount }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: QuizGenerationResponse = await response.json();

      if (data.success && data.quiz) {
        setQuiz(data.quiz.questions);
        toast({
          title: "Quiz generated!",
          description: `Generated ${data.quiz.questions.length} questions successfully.`,
        });
      } else {
        throw new Error(data.error || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-golden-100">
      {/* Authentication Overlay */}
      {!user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-golden-900/95 to-golden-800/95 backdrop-blur-sm">
          <div className="animate-fade-in-up max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-golden-200">
              <div className="text-center mb-6">
                <div className="animate-bounce-slow flex items-center justify-center w-16 h-16 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-golden-800 mb-2">Welcome to QuizCraft AI</h2>
                <p className="text-golden-600">Please sign in to start creating amazing quizzes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-golden-200 bg-white/80 backdrop-blur-sm animate-fade-in-down">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-golden-400 to-golden-600 rounded-xl animate-pulse-glow">
                <Brain className="w-6 h-6 text-white animate-float" />
              </div>
              <h1 className="text-3xl font-bold glow-text-strong shimmer-text">
                QuizCraft AI
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <UserMenu />
              ) : (
                              <Button
                onClick={() => setShowAuthModal(true)}
                variant="outline"
                className="border-golden-300 hover:bg-golden-50 btn-animate hover-lift"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              )}
              <Link
                to="/about"
                className="flex items-center gap-2 text-golden-700 hover:text-golden-800 transition-colors"
              >
                <Info className="w-4 h-4" />
                About
              </Link>
              <Button
                onClick={() => setDebugMode(!debugMode)}
                variant="ghost"
                size="sm"
                className="text-xs text-golden-600 hover:text-golden-800 btn-animate hover-glow"
              >
                {debugMode ? "Debug: ON" : "Debug: OFF"}
              </Button>
            </div>
          </div>
          <p className="text-center text-golden-700 mt-2 font-medium">
            Transform educational content into engaging quizzes with AI
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-stagger">
          {/* Upload Section */}
          <Card className="glass-effect border-golden-200 card-hover animate-fade-in-up">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl glow-text">
                <Upload className="w-6 h-6" />
                Upload Learning Material
              </CardTitle>
              <CardDescription className="text-golden-700">
                Upload a PDF chapter or paste text content to generate quiz questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="border-2 border-dashed border-golden-300 rounded-lg p-8 text-center hover:border-golden-400 transition-all duration-300 hover-lift">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileText className="w-12 h-12 text-golden-500 mx-auto mb-4 animate-float" />
                <p className="text-golden-700 mb-4">
                  Click to upload a PDF file or drag and drop
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white btn-animate hover-lift"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner"></div>
                      Uploading...
                    </div>
                  ) : (
                    "Choose PDF File"
                  )}
                </Button>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-golden-700">
                  Or paste your content directly:
                </label>
                <Textarea
                  placeholder="Paste your educational content here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[200px] bg-white/50 border-golden-300 focus:border-golden-500 input-animate"
                />
              </div>

              {/* Question Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-golden-700">
                  Number of questions to generate:
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white/50 border border-golden-300 rounded-md focus:border-golden-500 focus:outline-none input-animate"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                  <option value={30}>30 Questions</option>
                </select>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={generateQuiz}
                  disabled={isGenerating || !textContent.trim()}
                  className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white px-8 py-3 text-lg btn-animate hover-lift"
                >
                  {isGenerating ? (
                    <>
                      <div className="spinner mr-2"></div>
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2 animate-float" />
                      Generate {questionCount} Quiz Questions
                    </>
                  )}
                </Button>
                {debugMode && (
                  <div className="text-xs text-orange-600 mt-2">
                    Button state: {isGenerating ? 'Generating' : 'Ready'} | 
                    Text content: {textContent?.length || 0} chars | 
                    Disabled: {isGenerating || !textContent.trim() ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Debug Information */}
          {debugMode && (
            <Card className="glass-effect border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-orange-800">Debug Information</CardTitle>
                <CardDescription className="text-orange-700">
                  PDF Processing Troubleshooting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-orange-800">
                <div>
                  <h4 className="font-semibold mb-2">Common PDF Issues:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Password-protected PDFs cannot be processed</li>
                    <li>Image-only PDFs (scanned documents) require OCR</li>
                    <li>Corrupted PDF files may fail to process</li>
                    <li>Very large files (&gt;10MB) are not supported</li>
                    <li>Some PDFs with custom fonts may have issues</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Solutions:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Remove password protection from PDFs</li>
                    <li>Use text-based PDFs instead of scanned images</li>
                    <li>Copy and paste text content directly</li>
                    <li>Try a different PDF file</li>
                    <li>Check browser console for detailed error messages</li>
                  </ul>
                </div>
                <div className="text-xs text-orange-600">
                  <p>Check the browser console (F12) for detailed error logs when processing fails.</p>
                </div>
                <div className="border-t border-orange-200 pt-4">
                  <h4 className="font-semibold mb-2">PDF Processing Status:</h4>
                  <p className={`text-sm ${pdfTestResult.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {pdfTestResult || 'Testing...'}
                  </p>
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <p><strong>Note:</strong> PDF processing now uses an inline worker to avoid CORS issues. If PDF processing fails, you can always copy and paste the text content directly into the text area below.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quiz Display */}
          {quiz && (
            <Card className="glass-effect border-golden-200 card-hover animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 glow-text">
                  <BookOpen className="w-6 h-6" />
                  Generated Quiz ({quiz.length} Questions)
                </CardTitle>
                <CardDescription className="text-golden-700">
                  Review your AI-generated quiz questions, take the quiz, or export PDFs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuizViewer questions={quiz} />
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!quiz && (
            <Card className="glass-effect border-golden-200 text-center py-12">
              <CardContent>
                <Brain className="w-16 h-16 text-golden-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-golden-700 mb-2">
                  Ready to Create Amazing Quizzes?
                </h3>
                <p className="text-golden-600 max-w-md mx-auto">
                  Upload your educational content and let our AI generate engaging quiz questions 
                  that will help students learn and retain information better.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
