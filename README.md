# QuizMaker - Interactive Quiz Application

A modern, full-stack quiz application built with React, Firebase, and Netlify. Create, share, and take quizzes with real-time scoring and analytics.

## 🚀 Features

- **User Authentication**: Secure signup/login with Firebase Auth
- **Quiz Creation**: Build custom quizzes with multiple question types
- **Interactive Quizzes**: Take quizzes with real-time feedback
- **User Profiles**: Track quiz history and performance
- **Real-time Database**: Firestore integration for data persistence
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **PDF Processing**: Upload and process PDF documents
- **Netlify Functions**: Serverless backend for API endpoints

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI Components
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Netlify + GitHub
- **State Management**: React Context + Custom Hooks
- **Form Handling**: React Hook Form + Zod Validation

## 📱 Live Demo

[Deployed on Netlify](https://your-app-name.netlify.app)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Netlify account

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/quizmaker.git
cd quizmaker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:client` - Build client only
- `npm run build:functions` - Build Netlify functions
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript checks

## 📁 Project Structure

```
quizmaker/
├── client/                 # React frontend
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Firebase and utility functions
│   ├── pages/            # Page components
│   └── ui/               # UI component library
├── netlify/              # Netlify functions
├── server/               # Express server (development)
├── shared/               # Shared types and utilities
└── firestore.rules       # Firestore security rules
```

## 🔐 Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Deploy security rules: `firebase deploy --only firestore:rules`
5. Add your web app configuration

## 🌐 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository
2. Set build command: `npm run build:client`
3. Set publish directory: `dist/spa`
4. Add environment variables
5. Deploy!

### Manual Build
```bash
npm run build:client
# Upload dist/spa folder to your hosting provider
```

## 📊 Security

- Firestore security rules implemented
- User authentication required for data access
- Users can only access their own data
- Public quizzes are accessible to everyone

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/quizmaker/issues)
- **Documentation**: [Wiki](https://github.com/YOUR_USERNAME/quizmaker/wiki)
- **Firebase**: [Firebase Console](https://console.firebase.google.com/)

## 🙏 Acknowledgments

- Firebase for backend services
- Netlify for hosting and functions
- Tailwind CSS for styling
- Radix UI for accessible components

---

**Built with ❤️ using modern web technologies**
