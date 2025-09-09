import { type NextRequest, NextResponse } from "next/server"
import { getUserByWallet, toUnifiedProfile } from "@/lib/firebase-utils"

export async function GET(_req: NextRequest, { params }: { params: { address: string } }) {
  try {
    const { address } = params
    const user = await getUserByWallet(address)
    if (!user) {
      return NextResponse.json(
        { code: "WALLET_NOT_LINKED", message: "No profile found for this wallet" },
        { status: 404 },
      )
    }
    return NextResponse.json(toUnifiedProfile(user))
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 })
  }
}
