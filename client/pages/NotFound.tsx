import React from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-golden-100">
      {/* Header */}
      <header className="border-b border-golden-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-golden-700 hover:text-golden-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to QuizCraft AI
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect border-golden-200 text-center">
            <CardHeader className="pt-12 pb-6">
              <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl glow-text mb-2">
                404 - Page Not Found
              </CardTitle>
              <CardDescription className="text-golden-700 text-lg">
                Oops! The page you're looking for doesn't exist.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
              <p className="text-golden-600 mb-8 max-w-md mx-auto">
                It seems like you've wandered off the beaten path. Don't worry, 
                let's get you back to creating amazing quizzes with our AI-powered generator.
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white px-8 py-3"
              >
                <Link to="/">
                  Return to Quiz Generator
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
