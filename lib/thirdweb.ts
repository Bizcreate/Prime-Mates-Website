// /lib/thirdweb.ts
"use client";
import { createThirdwebClient } from "thirdweb";
import { ethereum, polygon, base, arbitrum } from "thirdweb/chains";
import { createWallet, inAppWallet } from "thirdweb/wallets";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// add any chain your holders actually use
export const supportedChains = [ethereum, polygon, base, arbitrum];

export const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
  inAppWallet({
    auth: { options: ["email", "google", "discord", "telegram"] },
  }),
];
