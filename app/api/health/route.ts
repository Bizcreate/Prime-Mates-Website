import { NextResponse } from "next/server"
import { createAuth } from "thirdweb/auth"
import { privateKeyToAccount } from "thirdweb/wallets"
import { client } from "@/lib/client"

export async function GET() {
  const domain = process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || null
  const hasClientId = Boolean(process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID)
  const hasSecret = Boolean(process.env.THIRDWEB_SECRET_KEY)
  const hasSigner = Boolean(process.env.AUTH_PRIVATE_KEY)
  let authOK = false

  try {
    if (domain && hasSigner) {
      createAuth({
        domain,
        adminAccount: privateKeyToAccount({ client, privateKey: process.env.AUTH_PRIVATE_KEY! }),
        client,
      })
      authOK = true
    }
  } catch {
    authOK = false
  }

  return NextResponse.json({
    ok: hasClientId && hasSecret && hasSigner && Boolean(domain) && authOK,
    domain,
    hasClientId,
    hasSecret,
    hasSigner,
    authOK,
  })
}
