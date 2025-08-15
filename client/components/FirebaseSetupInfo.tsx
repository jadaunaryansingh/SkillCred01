import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from "lucide-react";

export function FirebaseSetupInfo() {
  return (
    <Card className="glass-effect border-golden-200 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-golden-800">
          <Info className="w-5 h-5" />
          Firebase Configuration Required
        </CardTitle>
        <CardDescription className="text-golden-700">
          To enable quiz saving and user profiles, configure your Firebase Firestore security rules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The app works without Firestore, but saving quizzes requires proper security rules configuration.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h4 className="font-medium text-golden-800">Required Firestore Security Rules:</h4>
          <div className="bg-slate-100 p-4 rounded-lg border">
            <pre className="text-sm text-slate-800 whitespace-pre-wrap">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own quizzes
    match /quizzes/{quizId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Users can read/write their own quiz attempts
    match /quizAttempts/{attemptId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow reading public quizzes
    match /quizzes/{quizId} {
      allow read: if resource.data.isPublic == true;
    }
  }
}`}
            </pre>
          </div>
          
          <div className="text-sm text-golden-700">
            <p className="mb-2">To apply these rules:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to your Firebase Console</li>
              <li>Select your project (quizmaker-8ecad)</li>
              <li>Navigate to Firestore Database → Rules</li>
              <li>Replace the existing rules with the code above</li>
              <li>Click "Publish" to save the changes</li>
            </ol>
          </div>
          
          <a 
            href="https://console.firebase.google.com/project/quizmaker-8ecad/firestore/rules" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
          >
            <ExternalLink className="w-4 h-4" />
            Open Firebase Console
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
