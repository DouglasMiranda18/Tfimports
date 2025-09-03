// Configuração do Firebase para TFI IMPORTS
// IMPORTANTE: Configure as variáveis de ambiente no Netlify

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyD__XrPqFeh4_K0ih4l1reNvWxjW7VItPw",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "tfimports-27898.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "tfimports-27898",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "tfimports-27898.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "379291286011",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:379291286011:web:1feb4711b5235b04c4b35e",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-B742BVBRES"
};

// Validação de ambiente
const isProduction = import.meta.env?.VITE_APP_ENV === 'production';

export { firebaseConfig, isProduction };