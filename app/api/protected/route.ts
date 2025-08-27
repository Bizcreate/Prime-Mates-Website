import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAuth } from "thirdweb/auth"
import { privateKeyToAccount } from "thirdweb/wallets"
import { client } from "@/lib/client"

export async function GET() {
  const DOMAIN = process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || ""
  const PRIVATE_KEY = process.env.AUTH_PRIVATE_KEY || ""
  const jwt = cookies().get("jwt")

  if (!jwt?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const auth = createAuth({
    domain: DOMAIN,
    adminAccount: privateKeyToAccount({ client, privateKey: PRIVATE_KEY }),
    client,
  })

  const result = await auth.verifyJWT({ jwt: jwt.value })
  if (!result.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    address: result.parsedJWT?.sub,
  })
}
