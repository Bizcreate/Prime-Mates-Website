import { type NextRequest, NextResponse } from "next/server"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebaseClient"

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, userId } = await request.json()

    await setDoc(doc(db, "walletLinks", walletAddress), {
      userId,
      linkedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating wallet link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
