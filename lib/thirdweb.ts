"use client";
import { createThirdwebClient } from "thirdweb";
import { base, ethereum, polygon, arbitrum } from "thirdweb/chains";
import { createWallet, inAppWallet, walletConnect } from "thirdweb/wallets";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  // optional: route through thirdweb infra for better IPFS speed
  config: { storage: { gatewayUrls: ["https://cloudflare-ipfs.com/ipfs/", "https://ipfs.io/ipfs/"] } }
});

export const chains = [ethereum, polygon, base, arbitrum];

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
  createWallet("com.trustwallet.app"),

  // Phantom (and many others) via WalletConnect v2 — works on desktop & mobile
  walletConnect({
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!, // 0172cf3c... from your arcade
    metadata: {
      name: "Prime Mates",
      description: "Prime Mates Board Club",
      url: typeof window !== "undefined" ? window.location.origin : "https://prime-mates-website.vercel.app",
      icons: ["https://prime-mates-website.vercel.app/icon.png"],
    },
  }),

  // In-app email/social
  inAppWallet({ auth: { options: ["email", "google", "discord", "telegram"] } }),
];
