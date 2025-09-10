import { type NextRequest, NextResponse } from "next/server"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebaseClient"

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params

    const walletLinkDoc = await getDoc(doc(db, "walletLinks", address))

    if (walletLinkDoc.exists()) {
      return NextResponse.json(walletLinkDoc.data())
    } else {
      return NextResponse.json({ error: "Wallet link not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching wallet link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
