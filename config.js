// Configuração segura do Firebase
// IMPORTANTE: Nunca commite este arquivo com credenciais reais!

const firebaseConfig = {
  // Use variáveis de ambiente em produção
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "DEMO_KEY",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:123456789:web:demo",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-DEMO"
};

// Validação de ambiente
const isProduction = import.meta.env?.VITE_APP_ENV === 'production';
const isDemo = !isProduction && firebaseConfig.apiKey === "DEMO_KEY";

if (isDemo) {
  console.warn('⚠️ Executando em modo DEMO - configure as variáveis de ambiente para produção');
}

export { firebaseConfig, isProduction, isDemo };