"use client"
import { ConnectButton } from "thirdweb/react"
import { client } from "@/lib/client"
import { createWallet } from "thirdweb/wallets"
import { polygon, mainnet, base, arbitrum } from "thirdweb/chains"

const supportedChains = [mainnet, polygon, base, arbitrum]

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("com.trustwallet.app"),
  createWallet("io.zerion.wallet"),
  // Add Telegram wallet for Prime Arcade integration
  ...(typeof window !== "undefined" && window.Telegram ? [createWallet("org.telegram.wallet")] : []),
]

export default function ConnectWidget() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chains={supportedChains}
      connectButton={{
        label: "Connect Wallet",
        className:
          "bg-primary text-black border-primary hover:bg-primary/90 font-semibold px-6 py-2 rounded-lg glow-yellow-soft",
      }}
      detailsButton={{
        className:
          "bg-primary/10 text-primary border-primary hover:bg-primary/20 font-semibold px-4 py-2 rounded-lg glow-yellow-soft",
      }}
      switchButton={{
        className: "bg-gray-800 text-white border-gray-700 hover:bg-gray-700 font-semibold px-4 py-2 rounded-lg",
      }}
      theme="dark"
      showAllWallets={true}
      connectModal={{
        size: "wide",
        showThirdwebBranding: false,
      }}
    />
  )
}

export { ConnectWidget }
