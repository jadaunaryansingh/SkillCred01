import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Trophy, FileDown } from "lucide-react";
import { QuizQuestion } from "@shared/api";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  onBackToReview: () => void;
}

interface UserAnswer {
  questionId: number;
  selectedAnswer: string;
  isCorrect: boolean;
}

export default function InteractiveQuiz({ questions, onBackToReview }: InteractiveQuizProps) {
  // Add null check to prevent crashes
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-golden-600">No quiz questions available.</p>
        <Button onClick={onBackToReview} variant="outline" className="mt-4">
          Back to Review
        </Button>
      </div>
    );
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Add safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-golden-600">Invalid question data.</p>
        <Button onClick={onBackToReview} variant="outline" className="mt-4">
          Back to Review
        </Button>
      </div>
    );
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    const isCorrect = checkAnswer(selectedAnswer, currentQuestion.correctAnswer);
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
    };

    setUserAnswers(prev => [...prev, userAnswer]);
    setSelectedAnswer("");

    if (isLastQuestion) {
      setIsSubmitted(true);
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const checkAnswer = (selected: string, correct: string): boolean => {
    // Add safety checks
    if (!selected || !correct) return false;
    
    // For multiple choice, check if the selected option contains the correct answer
    if (selected.includes(correct)) return true;
    
    // For true/false, direct comparison
    if (selected === correct) return true;
    
    return false;
  };

  const getScore = () => {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    return {
      correct: correctAnswers,
      incorrect: totalQuestions - correctAnswers,
      percentage: Math.round((correctAnswers / totalQuestions) * 100)
    };
  };

  const getIncorrectQuestions = () => {
    return userAnswers
      .filter(answer => !answer.isCorrect)
      .map(answer => {
        const question = questions.find(q => q && q.id === answer.questionId);
        if (!question) {
          console.warn('Question not found for answer:', answer);
          return null;
        }
        return { ...answer, question };
      })
      .filter(Boolean); // Remove null entries
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
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      // Question number and text
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${question.question}`, 20, yPosition);
      yPosition += 10;

      // Options
      pdf.setFont("helvetica", "normal");
      question.options.forEach((option, optionIndex) => {
        pdf.text(`   ${option}`, 25, yPosition);
        yPosition += 7;
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
      // Check if we need a new page
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 20;
      }

      // Question
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${question.question}`, 20, yPosition);
      yPosition += 10;

      // Correct Answer
      pdf.setFont("helvetica", "normal");
      pdf.text(`Correct Answer: ${question.correctAnswer}`, 25, yPosition);
      yPosition += 7;

      // Explanation
      if (question.explanation) {
        const explanation = `Explanation: ${question.explanation}`;
        const lines = pdf.splitTextToSize(explanation, 160);
        lines.forEach((line: string) => {
          pdf.text(line, 25, yPosition);
          yPosition += 7;
        });
      }
      
      yPosition += 10;
    });

    pdf.save(`quiz-answer-key-${Date.now()}.pdf`);
    toast({
      title: "Answer key exported",
      description: "Answer key has been downloaded as a PDF file.",
    });
  };

  if (showResults) {
    const score = getScore();
    const incorrectQuestions = getIncorrectQuestions();

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card className="glass-effect border-golden-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl glow-text">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{score.correct}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{score.incorrect}</div>
                <div className="text-sm text-red-700">Incorrect</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{score.percentage}%</div>
                <div className="text-sm text-blue-700">Score</div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={onBackToReview} variant="outline" className="border-golden-300">
                Review All Questions
              </Button>
              <Button onClick={exportQuizPDF} variant="outline" className="border-golden-300">
                <FileDown className="w-4 h-4 mr-2" />
                Export Quiz PDF
              </Button>
              <Button onClick={exportAnswerKeyPDF} variant="outline" className="border-golden-300">
                <FileDown className="w-4 h-4 mr-2" />
                Export Answer Key PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Incorrect Questions */}
        {incorrectQuestions.length > 0 && (
          <Card className="glass-effect border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                Questions You Got Wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incorrectQuestions.map((item, index) => (
                <div key={item.questionId} className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="space-y-3">
                    <div className="font-medium text-red-800">
                      Question {item.questionId}: {item.question?.question}
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700">Your answer: {item.selectedAnswer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-700">Correct answer: {item.question?.correctAnswer}</span>
                      </div>
                    </div>
                    {item.question?.explanation && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {item.question.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="glass-effect border-golden-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-golden-700">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <span className="text-sm text-golden-700">
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-golden-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-golden-500 to-golden-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="glass-effect border-golden-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-golden-100 text-golden-700 border-golden-300">
              <Clock className="w-4 h-4 mr-1" />
              {currentQuestion.type.replace("-", " ").toUpperCase()}
            </Badge>
            <span className="text-sm text-golden-600">Question {currentQuestion.id}</span>
          </div>
          <CardTitle className="text-xl glow-text leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === option
                    ? "border-golden-500 bg-golden-50 shadow-md"
                    : "border-golden-200 bg-white hover:border-golden-300 hover:bg-golden-25"
                }`}
              >
                <span className="text-golden-800">{option}</span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button
              onClick={onBackToReview}
              variant="outline"
              className="border-golden-300 hover:bg-golden-50"
            >
              Back to Review
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white"
            >
              {isLastQuestion ? "Submit Quiz" : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
