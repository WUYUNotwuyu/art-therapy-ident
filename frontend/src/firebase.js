import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'
};

const hasValidConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
                      !import.meta.env.VITE_FIREBASE_API_KEY.includes('your_');

let app = null;
let auth = null;
let googleProvider = null;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { auth, googleProvider }; 