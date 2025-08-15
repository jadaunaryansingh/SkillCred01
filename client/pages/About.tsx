import React from "react";
import { ArrowLeft, Brain, Sparkles, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-golden-100">
      {/* Header */}
      <header className="border-b border-golden-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-golden-700 hover:text-golden-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to QuizCraft AI
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-golden-400 to-golden-600 rounded-lg">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold glow-text shimmer-text">QuizCraft AI</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <Card className="glass-effect border-golden-200 text-center">
            <CardHeader className="pt-12 pb-8">
              <CardTitle className="text-4xl glow-text-strong mb-4">
                About QuizCraft AI
              </CardTitle>
              <CardDescription className="text-golden-700 text-xl max-w-2xl mx-auto">
                Revolutionizing education with AI-powered quiz generation that transforms 
                any learning material into engaging assessment tools.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-effect border-golden-200 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="glow-text">AI-Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-golden-700 text-center">
                  Leveraging Google's Gemini AI to generate high-quality, 
                  contextual quiz questions from your educational content.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-golden-200 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="glow-text">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-golden-700 text-center">
                  Generate 20 comprehensive quiz questions in seconds, 
                  complete with explanations and answer keys.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect border-golden-200 hover:shadow-lg transition-all">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="glow-text">Educator-Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-golden-700 text-center">
                  Designed specifically for teachers and educators who want to 
                  create engaging assessments without spending hours crafting questions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="glass-effect border-golden-200">
            <CardHeader>
              <CardTitle className="text-2xl glow-text text-center mb-6">
                How QuizCraft AI Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full text-white font-bold text-lg">
                      1
                    </div>
                  </div>
                  <h3 className="font-semibold text-golden-800">Upload Content</h3>
                  <p className="text-golden-700 text-sm">
                    Upload a PDF chapter or paste your educational text content directly into the app.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full text-white font-bold text-lg">
                      2
                    </div>
                  </div>
                  <h3 className="font-semibold text-golden-800">AI Processing</h3>
                  <p className="text-golden-700 text-sm">
                    Our AI analyzes your content and generates diverse, high-quality quiz questions.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full text-white font-bold text-lg">
                      3
                    </div>
                  </div>
                  <h3 className="font-semibold text-golden-800">Review & Export</h3>
                  <p className="text-golden-700 text-sm">
                    Review the generated questions, view answers and explanations, then export your quiz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="glass-effect border-golden-200 text-center">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold glow-text mb-4">
                Ready to Transform Your Teaching?
              </h3>
              <p className="text-golden-700 mb-6 max-w-md mx-auto">
                Join thousands of educators who are already using QuizCraft AI to create 
                better assessments and engage their students.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white px-8 py-3"
              >
                <Link to="/">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Creating Quizzes
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
