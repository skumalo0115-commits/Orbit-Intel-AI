import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const runtimeConfig = window.__ORBIT_RUNTIME_CONFIG__ ?? {}

const firebaseConfig = {
  apiKey: (runtimeConfig.VITE_FIREBASE_API_KEY || (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined))?.trim(),
  authDomain: (runtimeConfig.VITE_FIREBASE_AUTH_DOMAIN || (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined))?.trim(),
  projectId: (runtimeConfig.VITE_FIREBASE_PROJECT_ID || (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined))?.trim(),
  storageBucket: (runtimeConfig.VITE_FIREBASE_STORAGE_BUCKET || (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined))?.trim(),
  messagingSenderId: (runtimeConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined))?.trim(),
  appId: (runtimeConfig.VITE_FIREBASE_APP_ID || (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined))?.trim(),
}

const requiredFirebaseEnv = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
}

export const missingFirebaseEnvKeys = Object.entries(requiredFirebaseEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const firebaseEnabled = missingFirebaseEnvKeys.length === 0

const firebaseApp = firebaseEnabled ? initializeApp(firebaseConfig) : null

// Safe helpers: never throw here. UI should show a clean message instead of an internal error.
export const canUseGoogleSignIn = () => firebaseEnabled

export const getFirebaseAuthOrNull = () => {
  if (!firebaseApp) return null
  return getAuth(firebaseApp)
}

export const getGoogleProvider = () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}
