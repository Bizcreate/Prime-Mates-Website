/**
 * Firebase Web SDK initialiser for CLIENT ONLY.
 * - Guards against SSR/prerender execution to prevent auth/invalid-api-key at build time.
 * - Uses hardcoded Firebase config for Prime Mates BC project.
 */
"use client"

import { type FirebaseOptions, initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCfmmgC2wEDAv6k3dptl9lzsKgyMeoLKF4",
  authDomain: "primematebc.firebaseapp.com",
  projectId: "primematebc",
  storageBucket: "primematebc.firebasestorage.app",
  messagingSenderId: "910094315394",
  appId: "1:910094315394:web:cb45e2788b5f0a3ac1299b",
  measurementId: "G-PLRM0FEWT4",
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
