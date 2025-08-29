"use client"
import { ConnectButton } from "thirdweb/react"
import { client } from "@/lib/client"
import { createWallet } from "thirdweb/wallets"
import { polygon, mainnet } from "thirdweb/chains"

const chainName = (process.env.NEXT_PUBLIC_DEFAULT_CHAIN || "polygon").toLowerCase()
const defaultChain = chainName === "mainnet" ? mainnet : polygon

const wallets = [createWallet("io.metamask"), createWallet("com.coinbase.wallet"), createWallet("me.rainbow")]

export default function ConnectWidget() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={defaultChain}
      connectButton={{
        label: "Connect Wallet",
        className:
          "bg-primary text-black border-primary hover:bg-primary/90 font-semibold px-6 py-2 rounded-lg glow-yellow-soft",
      }}
      detailsButton={{
        className:
          "bg-primary/10 text-primary border-primary hover:bg-primary/20 font-semibold px-4 py-2 rounded-lg glow-yellow-soft",
      }}
      theme="dark"
    />
  )
}

export { ConnectWidget }
