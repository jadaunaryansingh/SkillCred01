# Firebase Setup Guide

## Current Issues & Solutions

### 1. Firestore Security Rules
The main error you're experiencing is due to missing Firestore security rules. I've created `firestore.rules` in your project root.

**To deploy these rules:**
```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the security rules
firebase deploy --only firestore:rules
```

### 2. Firebase Project Configuration
Ensure your Firebase project is properly configured:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `quizmaker-8ecad`
3. Go to Project Settings > General
4. Verify your web app configuration matches `client/lib/firebase.ts`

### 3. Firestore Database Setup
1. In Firebase Console, go to Firestore Database
2. Create database if it doesn't exist
3. Start in test mode initially (you can secure it later with the rules)

### 4. Authentication Setup
1. In Firebase Console, go to Authentication
2. Enable Email/Password authentication
3. Add your domain to authorized domains if needed

## Security Rules Explanation

The rules I created allow:
- Users to read/write their own profiles
- Users to read/write their own quizzes
- Users to read/write their own quiz attempts
- Public access to public quizzes
- Proper authentication checks

## Testing Your Setup

1. **Deploy the security rules** using Firebase CLI
2. **Test authentication** - users should be able to sign up/sign in
3. **Test profile creation** - new users should have profiles created automatically
4. **Test quiz operations** - users should be able to create/read their own quizzes

## Common Issues & Fixes

### "Firestore access denied"
- Deploy the security rules
- Ensure user is authenticated
- Check if the user document exists

### "Missing or insufficient permissions"
- Verify security rules are deployed
- Check if the user is properly authenticated
- Ensure the user document exists in Firestore

### PDF.js Worker Issues
- These are usually informational messages, not errors
- If causing problems, check your PDF processing configuration

## Development vs Production

- **Development**: You can use Firebase emulators for local testing
- **Production**: Always deploy security rules before going live
- **Testing**: Test with real Firebase project to ensure rules work correctly

## Next Steps

1. Deploy the security rules
2. Test user authentication
3. Test profile creation
4. Test quiz operations
5. Monitor Firebase Console for any remaining errors

## Support

If you continue to experience issues:
1. Check Firebase Console for error logs
2. Verify your project configuration
3. Ensure all dependencies are properly installed
4. Check browser console for detailed error messages


