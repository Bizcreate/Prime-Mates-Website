"use client"
import { ConnectButton } from "thirdweb/react"
import { client } from "@/lib/client"
import { createWallet } from "thirdweb/wallets"
import { polygon, mainnet } from "thirdweb/chains"
import { useMemo } from "react"
import { generatePayload, isLoggedIn, login, logout } from "@/actions/login"

const chainName = (process.env.NEXT_PUBLIC_DEFAULT_CHAIN || "polygon").toLowerCase()
const defaultChain = chainName === "mainnet" ? mainnet : polygon
const enableAA = (process.env.NEXT_PUBLIC_ENABLE_AA || "false").toLowerCase() === "true"
const sponsorGas = (process.env.NEXT_PUBLIC_SPONSOR_GAS || "false").toLowerCase() === "true"

export default function ConnectWidget() {
  const wallets = useMemo(
    () => [
      createWallet("io.metamask"),
      createWallet("com.coinbase.wallet"),
      createWallet("me.rainbow"),
      createWallet("com.trustwallet.app"),
    ],
    [],
  )

  return (
    <ConnectButton
      client={client}
      chain={defaultChain}
      wallets={wallets}
      // Enable Account Abstraction + optional gas sponsorship
      accountAbstraction={enableAA ? { chain: defaultChain, sponsorGas } : undefined}
      // Hook thirdweb Auth into the button flow
      auth={{
        isLoggedIn: async () => await isLoggedIn(),
        getLoginPayload: async ({ address }) => await generatePayload({ address }),
        doLogin: async (params) => await login(params),
        doLogout: async () => await logout(),
      }}
      theme="dark"
      connectButton={{
        label: "Connect Wallet",
        className:
          "!bg-primary !text-black !border-primary hover:!bg-primary/90 !font-semibold !px-6 !py-2 !rounded-lg glow-yellow-soft",
      }}
      connectModal={{ size: "compact" }}
    />
  )
}
