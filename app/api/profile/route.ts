import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/packages/prime-shared/firebase/client"
import { doc, setDoc } from "firebase/firestore"

export async function POST(request: NextRequest) {
  try {
    const profile = await request.json()

    await setDoc(doc(db, "profiles", profile.id), profile)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
