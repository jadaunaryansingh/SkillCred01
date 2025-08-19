# Deployment Guide: GitHub → Netlify → Firebase

## 🚀 Complete Deployment Workflow

### Prerequisites
- ✅ Firebase project configured (`quizmaker-8ecad`)
- ✅ Firestore security rules deployed
- ✅ Netlify account
- ✅ GitHub account

## 📋 Step-by-Step Deployment

### 1. GitHub Setup & Push

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: QuizMaker app with Firebase integration"

# Add your GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 2. Netlify Deployment

#### Option A: Connect GitHub Repository (Recommended)
1. Go to [Netlify](https://app.netlify.com/)
2. Click "New site from Git"
3. Choose GitHub
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build:client`
   - **Publish directory**: `dist/spa`
   - **Functions directory**: `netlify/functions`

#### Option B: Manual Deploy
```bash
# Build the project
npm run build:client

# Deploy to Netlify (if you have Netlify CLI)
npm install -g netlify-cli
netlify deploy --prod --dir=dist/spa
```

### 3. Environment Variables in Netlify

Go to **Site settings** → **Environment variables** and add:

```
VITE_FIREBASE_API_KEY=AIzaSyC11pLkbwWuurTTHrsHq_82Xi-iBCV91Ho
VITE_FIREBASE_AUTH_DOMAIN=quizmaker-8ecad.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=quizmaker-8ecad
VITE_FIREBASE_STORAGE_BUCKET=quizmaker-8ecad.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=66210053262
VITE_FIREBASE_APP_ID=1:66210053262:web:15729c49ba507315b15ddf
VITE_FIREBASE_MEASUREMENT_ID=G-CK2T12V7TE
NODE_ENV=production
```

### 4. Firebase Security Rules (Already Done ✅)

Your Firestore security rules are already deployed and working.

## 🔧 Build Configuration

### Package.json Scripts
- `npm run build:client` - Builds the React app for production
- `npm run build:functions` - Builds Netlify functions
- `npm run build` - Builds both client and functions

### Netlify Configuration
- **Build command**: `npm run build:client`
- **Publish directory**: `dist/spa`
- **Functions**: `netlify/functions`

## 🌐 Domain & SSL

Netlify automatically provides:
- ✅ HTTPS/SSL certificates
- ✅ Custom domain support
- ✅ CDN distribution
- ✅ Automatic deployments on git push

## 📱 Testing Your Deployment

1. **Authentication**: Test user signup/signin
2. **Firestore**: Verify data can be read/written
3. **Functions**: Test API endpoints
4. **Performance**: Check loading times

## 🚨 Common Issues & Solutions

### Firebase Errors
- **"Firestore access denied"**: Security rules are deployed ✅
- **"Missing permissions"**: User authentication working ✅
- **CORS issues**: Netlify handles this automatically

### Build Errors
- **Missing dependencies**: Run `npm install` before building
- **TypeScript errors**: Check `tsconfig.json` configuration
- **Environment variables**: Ensure they're set in Netlify

### Deployment Issues
- **Build timeout**: Optimize build process
- **Function errors**: Check Netlify function logs
- **404 errors**: Verify redirect rules in `netlify.toml`

## 🔄 Continuous Deployment

### Automatic Deploys
- Push to `main` branch → Automatic Netlify deployment
- Push to other branches → Preview deployments
- Pull requests → Deploy previews

### Manual Deploys
```bash
# Trigger manual deployment
netlify deploy --prod
```

## 📊 Monitoring & Analytics

### Firebase Console
- Monitor Firestore usage
- Check authentication logs
- View performance metrics

### Netlify Analytics
- Page load times
- Function execution times
- Error rates

## 🎯 Next Steps

1. **Deploy to GitHub** ✅
2. **Connect to Netlify** ✅
3. **Set environment variables** ✅
4. **Test all functionality** ✅
5. **Monitor performance** ✅
6. **Set up custom domain** (optional)

## 🆘 Support

- **Firebase**: [Firebase Console](https://console.firebase.google.com/)
- **Netlify**: [Netlify Support](https://docs.netlify.com/)
- **GitHub**: [GitHub Docs](https://docs.github.com/)

---

**Your app is now ready for production deployment! 🎉**
