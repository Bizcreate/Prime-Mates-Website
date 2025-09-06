"use client"
/**
 * Centralized thirdweb client & config exports.
 * Why: isolates client-only imports so Server Components never import from "thirdweb/react" directly.
 */
import { createThirdwebClient } from "thirdweb"
import { ethereum, polygon, base, arbitrum } from "thirdweb/chains"
import { createWallet, inAppWallet } from "thirdweb/wallets"

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
})

export const chains = [ethereum, polygon, base, arbitrum]

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
  // In-app wallet lets users sign in with email/social
  inAppWallet({
    auth: {
      options: ["email", "google", "discord", "telegram"],
    },
  }),
]
