import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/packages/prime-shared/firebase/client"
import { doc, getDoc } from "firebase/firestore"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params

    const profileDoc = await getDoc(doc(db, "profiles", address))

    if (profileDoc.exists()) {
      return NextResponse.json(profileDoc.data())
    } else {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
