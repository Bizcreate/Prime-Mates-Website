/**
 * Firebase Web SDK initialiser for CLIENT ONLY.
 * - Guards against SSR/prerender execution to prevent auth/invalid-api-key at build time.
 * - Reads NEXT_PUBLIC_* env vars that must be set in Vercel (Production & Preview).
 */
"use client"

import { type FirebaseOptions, initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export function getFirebaseApp() {
  if (typeof window === "undefined") {
    // why: never initialise Firebase during SSR/SSG
    throw new Error("Firebase client can only run in the browser")
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getFirestore> | null = null

// Initialize auth and db only in browser
if (typeof window !== "undefined") {
  try {
    const app = getFirebaseApp()
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (error) {
    console.error("[v0] Firebase initialization error:", error)
  }
}

export { auth, db }
