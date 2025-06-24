# Art Therapy Frontend

A React-based frontend for the Art Therapy Mood Tracker application.

## Features

- 🎨 Drawing canvas with react-konva
- 🔐 Google authentication via Firebase
- 🌙 Dark mode support
- 📱 PWA support
- 📊 Mood tracking with Chart.js
- 🪙 Coin reward system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure Firebase:
   - Create a Firebase project
   - Enable Google authentication
   - Add your Firebase config to `.env`

4. Start development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_API_URL=http://localhost:8000
```

## PWA Icons

Replace the placeholder files in `public/icons/` with actual PNG icons:
- `192.png` - 192x192px icon
- `512.png` - 512x512px icon

## Building

```bash
npm run build
```

The built files will be in the `dist/` directory. 