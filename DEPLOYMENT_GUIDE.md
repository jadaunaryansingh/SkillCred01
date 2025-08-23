# Quiz Maker - Netlify Deployment Guide

## Overview
This guide will help you deploy the Quiz Maker application to Netlify with full PDF.CO API integration for serverless PDF processing.

## Prerequisites
- GitHub repository with your Quiz Maker code
- Netlify account
- PDF.CO API key (already configured)

## Step 1: Prepare Your Repository

### 1.1 Install Netlify Function Dependencies
```bash
cd netlify/functions
npm install
```

### 1.2 Build the Application
```bash
npm run build
```

This will:
- Build the React frontend (`dist/spa/`)
- Build the Netlify functions (`netlify/functions/`)

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify UI (Recommended)

1. **Connect to GitHub**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose GitHub and select your repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/spa`
   - **Functions directory**: `netlify/functions`

3. **Set Environment Variables**
   - Go to Site settings > Environment variables
   - Add: `PDF_CO_API_KEY` = `aryansinghjadaun@gmail.com_IR4ErjQrrR9cMHVIfwd5APD4v08CgP1dEYCvfQiZRlKr3SfWNLxwzfnHxsEYrizY`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Step 3: Verify Deployment

### 3.1 Check Function Endpoints
Your deployed site will have these endpoints:
- `https://yoursite.netlify.app/api/ping` - Health check
- `https://yoursite.netlify.app/api/process-pdf-co` - PDF processing with PDF.CO API
- `https://yoursite.netlify.app/api/generate-quiz` - Quiz generation

### 3.2 Test PDF Processing
1. Upload a PDF file through the web interface
2. Check Netlify function logs for processing details
3. Verify text extraction works correctly

## Step 4: Environment Configuration

### 4.1 Production Environment Variables
Ensure these are set in Netlify:
- `PDF_CO_API_KEY`: Your PDF.CO API key
- `NODE_ENV`: `production`

### 4.2 Function Configuration
The `netlify.toml` file is already configured with:
- Build command and publish directory
- Function routing (`/api/*` → `/.netlify/functions/api/:splat`)
- ESBuild bundler for functions

## Troubleshooting

### Common Issues

1. **Function Build Failures**
   - Check `netlify/functions/package.json` has all dependencies
   - Ensure `npm install` runs in functions directory

2. **PDF Processing Errors**
   - Verify PDF.CO API key is set correctly
   - Check function logs in Netlify dashboard
   - Ensure file size is under 10MB limit

3. **CORS Issues**
   - CORS is already configured in the function
   - Check if requests are reaching the function

### Debugging

1. **Check Function Logs**
   - Go to Netlify dashboard > Functions > View logs
   - Look for error messages and request details

2. **Test Endpoints**
   - Use browser dev tools to check network requests
   - Verify function responses

3. **Local Testing**
   - Test locally with `npm run dev:full`
   - Compare local vs deployed behavior

## Benefits of Netlify Deployment

✅ **No Local Machine Required**: Functions run on Netlify's servers
✅ **Automatic Scaling**: Handles multiple users simultaneously  
✅ **Global CDN**: Fast loading worldwide
✅ **Automatic Deployments**: Updates on every Git push
✅ **Cost Effective**: Generous free tier for personal projects
✅ **PDF.CO Integration**: Full serverless PDF processing

## Maintenance

### Updates
- Push changes to GitHub
- Netlify automatically rebuilds and deploys
- No manual intervention required

### Monitoring
- Check Netlify dashboard for function performance
- Monitor PDF processing success rates
- Review error logs regularly

## Support

If you encounter issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test endpoints individually
4. Check PDF.CO API status

---

**Your Quiz Maker app is now fully serverless and will work without your local machine running!** 🚀
