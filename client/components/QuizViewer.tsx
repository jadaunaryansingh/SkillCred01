import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, EyeOff, HelpCircle, FileCheck, Play, FileDown, Save } from "lucide-react";
import { QuizQuestion } from "@shared/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveQuiz } from "@/lib/firebaseUtils";
import InteractiveQuiz from "./InteractiveQuiz";
import jsPDF from 'jspdf';

interface QuizViewerProps {
  questions: QuizQuestion[];
}

export default function QuizViewer({ questions }: QuizViewerProps) {
  // Add null check to prevent crashes
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-golden-600">No quiz questions available yet.</p>
        <p className="text-sm text-golden-500 mt-2">Generate a quiz to get started!</p>
      </div>
    );
  }

  const [showAnswers, setShowAnswers] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);
  const [quizMode, setQuizMode] = useState<'review' | 'interactive'>('review');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleExplanation = (questionId: number) => {
    setExpandedExplanation(expandedExplanation === questionId ? null : questionId);
  };

  const exportQuizPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Quiz Questions", 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    questions.forEach((question, index) => {
      // Add safety check for question properties
      if (!question || !question.question || !question.options) {
        console.warn('Skipping invalid question in PDF export:', question);
        return;
      }

      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // Question number and text
      pdf.setFont("helvetica", "bold");
      const questionText = `${index + 1}. ${question.question}`;
      const questionLines = pdf.splitTextToSize(questionText, 170);
      questionLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 7;
      });
      yPosition += 3;

      // Options
      pdf.setFont("helvetica", "normal");
      question.options.forEach((option) => {
        if (!option) return; // Skip undefined options
        const optionLines = pdf.splitTextToSize(`   ${option}`, 165);
        optionLines.forEach((line: string) => {
          pdf.text(line, 25, yPosition);
          yPosition += 7;
        });
      });

      yPosition += 10;
    });

    pdf.save(`quiz-${Date.now()}.pdf`);
    toast({
      title: "Quiz exported",
      description: "Quiz has been downloaded as a PDF file.",
    });
  };

  const exportAnswerKeyPDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Title
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Quiz Answer Key", 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    questions.forEach((question, index) => {
      // Add safety check for question properties
      if (!question || !question.question || !question.correctAnswer) {
        console.warn('Skipping invalid question in answer key PDF export:', question);
        return;
      }

      // Check if we need a new page
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }

      // Question
      pdf.setFont("helvetica", "bold");
      const questionText = `${index + 1}. ${question.question}`;
      const questionLines = pdf.splitTextToSize(questionText, 170);
      questionLines.forEach((line: string) => {
        pdf.text(line, 20, yPosition);
        yPosition += 7;
      });

      // Correct Answer
      pdf.setFont("helvetica", "normal");
      pdf.text(`Correct Answer: ${question.correctAnswer}`, 25, yPosition);
      yPosition += 10;

      // Explanation
      if (question.explanation) {
        const explanation = `Explanation: ${question.explanation}`;
        const explanationLines = pdf.splitTextToSize(explanation, 160);
        explanationLines.forEach((line: string) => {
          pdf.text(line, 25, yPosition);
          yPosition += 7;
        });
      }

      yPosition += 12;
    });

    pdf.save(`quiz-answer-key-${Date.now()}.pdf`);
    toast({
      title: "Answer key exported",
      description: "Answer key has been downloaded as a PDF file.",
    });
  };

  const saveQuizToFirebase = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your quiz.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const quizData = {
        title: `Quiz - ${new Date().toLocaleDateString()}`,
        questions,
        userId: user.uid,
        isPublic: false,
        tags: ["ai-generated"]
      };

      const result = await saveQuiz(quizData);

      if (result.success) {
        toast({
          title: "Quiz saved!",
          description: "Your quiz has been saved to your account.",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.warn("Quiz save error:", error);

      let errorMessage = "Failed to save quiz.";
      if (error?.message?.includes("Missing or insufficient permissions")) {
        errorMessage = "Firestore permissions not configured. Please check your Firebase security rules.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Save failed",
        description: errorMessage + " You can still export the quiz as PDF.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getQuestionIcon = (type: QuizQuestion["type"]) => {
    return type === "multiple-choice" ? (
      <FileCheck className="w-4 h-4" />
    ) : (
      <HelpCircle className="w-4 h-4" />
    );
  };

  const getAnswerIcon = (isCorrect: boolean) => {
    return isCorrect ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  if (quizMode === 'interactive') {
    return (
      <InteractiveQuiz
        questions={questions}
        onBackToReview={() => setQuizMode('review')}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 animate-stagger">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-golden-300 text-golden-700">
            {questions.filter(q => q.type === "multiple-choice").length} Multiple Choice
          </Badge>
          <Badge variant="outline" className="border-golden-300 text-golden-700">
            {questions.filter(q => q.type === "true-false").length} True/False
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setQuizMode('interactive')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white btn-animate hover-lift"
          >
            <Play className="w-4 h-4 mr-2" />
            Take Quiz
          </Button>
          {user && (
            <Button
              onClick={saveQuizToFirebase}
              disabled={isSaving}
              variant="outline"
              className="border-green-300 hover:bg-green-50 text-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Quiz"}
            </Button>
          )}
          <Button
            onClick={exportQuizPDF}
            variant="outline"
            className="border-golden-300 hover:bg-golden-50"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Quiz PDF
          </Button>
          <Button
            onClick={exportAnswerKeyPDF}
            variant="outline"
            className="border-golden-300 hover:bg-golden-50"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Answer Key PDF
          </Button>
          <Button
            onClick={() => setShowAnswers(!showAnswers)}
            variant="outline"
            className="border-golden-300 hover:bg-golden-50"
          >
            {showAnswers ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Answers
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Show Answers
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 animate-stagger">
        {questions.map((question, index) => {
          // Add safety check for individual question properties
          if (!question || !question.options || !question.type) {
            console.warn('Invalid question data:', question);
            return null;
          }
          
          return (
            <Card key={question.id || index} className="bg-white/60 border-golden-200 hover:shadow-lg transition-all duration-200 card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start gap-3 text-lg">
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center justify-center w-6 h-6 bg-golden-500 text-white text-sm font-bold rounded-full">
                      {index + 1}
                    </span>
                    <Badge 
                      variant="secondary"
                      className="bg-golden-100 text-golden-700 border-golden-300"
                    >
                      {getQuestionIcon(question.type)}
                      <span className="ml-1 capitalize">
                        {question.type?.replace("-", " ") || "Question"}
                      </span>
                    </Badge>
                  </div>
                  <span className="text-golden-800 leading-relaxed">
                    {question.question || "Question text not available"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Options */}
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => {
                    if (!option) return null;
                    const isCorrect = showAnswers && option === question.correctAnswer;
                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          showAnswers
                            ? isCorrect
                              ? "bg-green-50 border-green-300 text-green-800"
                              : "bg-gray-50 border-gray-200 text-gray-600"
                            : "bg-white border-golden-200 hover:border-golden-300"
                        }`}
                      >
                        {showAnswers && getAnswerIcon(isCorrect)}
                        <span className="flex-1">{option}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Answer and Explanation */}
                {showAnswers && (
                  <div className="border-t border-golden-200 pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-700">
                        Correct Answer: {question.correctAnswer}
                      </span>
                    </div>
                    
                    {question.explanation && (
                      <div>
                        <Button
                          onClick={() => toggleExplanation(question.id)}
                          variant="ghost"
                          size="sm"
                          className="text-golden-700 hover:text-golden-800 hover:bg-golden-50 p-0 h-auto font-medium"
                        >
                          {expandedExplanation === question.id ? "Hide" : "Show"} Explanation
                        </Button>
                        
                        {expandedExplanation === question.id && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm leading-relaxed">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
