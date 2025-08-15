import React from "react";
import { ArrowLeft, Construction } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderProps {
  title?: string;
  description?: string;
}

export default function Placeholder({ 
  title = "Page Under Construction", 
  description = "This page is being developed. Please check back later!" 
}: PlaceholderProps) {
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
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full">
                  <Construction className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl glow-text mb-2">
                {title}
              </CardTitle>
              <CardDescription className="text-golden-700 text-lg">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
              <p className="text-golden-600 mb-8 max-w-md mx-auto">
                We're working hard to bring you amazing new features. 
                In the meantime, feel free to continue creating quizzes with our AI-powered generator.
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
