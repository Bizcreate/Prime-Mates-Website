import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfmmgC2wEDAv6k3dptl9lzsKgyMeoLKF4",
  authDomain: "primematebc.firebaseapp.com",
  projectId: "primematebc",
  storageBucket: "primematebc.firebasestorage.app",
  messagingSenderId: "910094315394",
  appId: "1:910094315394:web:cb45e2788b5f0a3ac1299b",
  measurementId: "G-PLRM0FEWT4",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export default app
