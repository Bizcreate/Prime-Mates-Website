import { type NextRequest, NextResponse } from "next/server"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebaseClient"

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params

    const userDoc = await getDoc(doc(db, "users", uid))

    if (userDoc.exists()) {
      return NextResponse.json({ uid, ...userDoc.data() })
    } else {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
