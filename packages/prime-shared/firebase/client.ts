import { initializeApp, getApps } from "firebase/app"
import { getAuth, signInWithCustomToken, onAuthStateChanged, type User } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyCfmmgC2wEDAv6k3dptl9lzsKgyMeoLKF4",
  authDomain: "primematebc.firebaseapp.com",
  projectId: "primematebc",
  storageBucket: "primematebc.firebasestorage.app",
  messagingSenderId: "910094315394",
  appId: "1:910094315394:web:cb45e2788b5f0a3ac1299b",
  measurementId: "G-PLRM0FEWT4",
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null

export async function signInToFirebaseWithCustomToken(getToken: () => Promise<string>) {
  const token = await getToken()
  await signInWithCustomToken(auth, token)
}

export function onAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}
