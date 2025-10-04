// lib/firebase/arcade.ts
"use client";

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCfmmgC2wEDAv6k3dptl9lzsKgyMeoLKF4",
  authDomain: "primematebc.firebaseapp.com",
  projectId: "primematebc",
  storageBucket: "primematebc.firebasestorage.app",
  messagingSenderId: "910094315394",
  appId: "1:910094315394:web:cb45e2788b5f0a3ac1299b",
  measurementId: "G-PLRM0FEWT4",
};

export function getFirebaseApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client can only run in the browser");
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (typeof window !== "undefined") {
  try {
    const app = getFirebaseApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error("[firebase] init error:", err);
  }
}

export { auth, db };
