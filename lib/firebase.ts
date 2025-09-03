import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCfmmgC2wEDAv6k3dptl9lzsKgyMeoLKF4",
  authDomain: "primematebc.firebaseapp.com",
  projectId: "primematebc",
  storageBucket: "primematebc.firebasestorage.app",
  messagingSenderId: "910094315394",
  appId: "1:910094315394:web:cb45e2788b5f0a3ac1299b",
  measurementId: "G-PLRM0FEWT4",
}

const firebase_app = initializeApp(firebaseConfig)
export const auth = getAuth(firebase_app)
export const db = getFirestore(firebase_app)
export const storage = getStorage(firebase_app)

export default firebase_app
