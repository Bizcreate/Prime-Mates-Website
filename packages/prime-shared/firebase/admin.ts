import { initializeApp as initAdmin, getApps as getAdminApps, cert } from "firebase-admin/app"
import { getAuth as getAdminAuth } from "firebase-admin/auth"
import { getFirestore as getAdminStore } from "firebase-admin/firestore"

let adminApp = getAdminApps()[0]
if (!adminApp) {
  adminApp = initAdmin({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

export const adminAuth = getAdminAuth(adminApp)
export const adminDb = getAdminStore(adminApp)
