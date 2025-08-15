import React from "react";
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { FirebaseSetupInfo } from "@/components/FirebaseSetupInfo";

export default function FirebaseSetup() {
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold glow-text mb-4">Firebase Configuration</h1>
            <p className="text-golden-700 text-lg">
              Optional setup to enable quiz saving and user profiles
            </p>
          </div>

          <FirebaseSetupInfo />

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-golden-500 to-golden-600 hover:from-golden-600 hover:to-golden-700 text-white px-6 py-3 rounded-lg transition-all"
            >
              Continue to QuizCraft AI
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
