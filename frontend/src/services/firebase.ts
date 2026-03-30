import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim(),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined)?.trim(),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim(),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined)?.trim(),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined)?.trim(),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined)?.trim(),
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

export const getFirebaseAuth = () => {
  if (!firebaseApp) {
    throw new Error(`Firebase Google sign-in is not configured yet. Missing: ${missingFirebaseEnvKeys.join(', ')}`)
  }

  return getAuth(firebaseApp)
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
