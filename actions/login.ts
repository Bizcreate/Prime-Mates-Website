"use server"
import { cookies } from "next/headers"
import { createAuth, type VerifyLoginPayloadParams } from "thirdweb/auth"
import { privateKeyToAccount } from "thirdweb/wallets"
import { client } from "@/lib/client"
import { randomBytes } from "crypto"

const DOMAIN = process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || ""
const PRIVATE_KEY = process.env.AUTH_PRIVATE_KEY || ""

if (!DOMAIN) throw new Error("Missing NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN")

let authPrivateKey = PRIVATE_KEY
if (!authPrivateKey) {
  console.warn("[v0] AUTH_PRIVATE_KEY not found, generating temporary key for development")
  const randomBytesBuffer = randomBytes(32)
  authPrivateKey = "0x" + randomBytesBuffer.toString("hex")
  console.warn("[v0] Using temporary key - set AUTH_PRIVATE_KEY environment variable for production")
}

const auth = createAuth({
  domain: DOMAIN,
  adminAccount: privateKeyToAccount({ client, privateKey: authPrivateKey }),
  client,
})

export const generatePayload = auth.generatePayload

export async function login(payload: VerifyLoginPayloadParams) {
  const verified = await auth.verifyPayload(payload)
  if (!verified.valid) return
  const jwt = await auth.generateJWT({ payload: verified.payload })
  // HttpOnly cookie protects session
  cookies().set("jwt", jwt, { httpOnly: true, sameSite: "lax", path: "/" })
}

export async function isLoggedIn() {
  const jwt = cookies().get("jwt")
  if (!jwt?.value) return false
  const res = await auth.verifyJWT({ jwt: jwt.value })
  return res.valid
}

export async function logout() {
  cookies().delete("jwt")
}
