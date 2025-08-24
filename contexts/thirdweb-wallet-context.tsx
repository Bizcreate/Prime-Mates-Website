"use client"

import { createContext, useContext, type ReactNode } from "react"
import { ThirdwebProvider, ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react"
import { createThirdwebClient } from "thirdweb"
import { COLLECTION_CONTRACTS } from "@/lib/thirdweb-config"
import { getContract } from "thirdweb"
import { balanceOf } from "thirdweb/extensions/erc721"

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
})

const ThirdwebWalletContext = createContext<{
  address: string | undefined
  isConnected: boolean
}>({
  address: undefined,
  isConnected: false,
})

export function ThirdwebWalletProvider({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </ThirdwebProvider>
  )
}

function WalletContextProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount()
  const address = account?.address
  const isConnected = !!address

  console.log("[v0] Thirdweb wallet context - Address:", address, "Connected:", isConnected)

  return <ThirdwebWalletContext.Provider value={{ address, isConnected }}>{children}</ThirdwebWalletContext.Provider>
}

export const useThirdwebWallet = () => useContext(ThirdwebWalletContext)

// Hook to fetch user's NFTs across all collections
export function useUserNFTs() {
  const { address, isConnected } = useThirdwebWallet()

  const pmbcContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-mates-board-club"].chain,
    address: COLLECTION_CONTRACTS["prime-mates-board-club"].address,
  })

  const pttbContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-to-the-bone"].chain,
    address: COLLECTION_CONTRACTS["prime-to-the-bone"].address,
  })

  const halloweenContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-halloween"].chain,
    address: COLLECTION_CONTRACTS["prime-halloween"].address,
  })

  const christmasContract = getContract({
    client,
    chain: COLLECTION_CONTRACTS["prime-christmas"].chain,
    address: COLLECTION_CONTRACTS["prime-christmas"].address,
  })

  const { data: pmbcBalance } = useReadContract(balanceOf, {
    contract: pmbcContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  })

  const { data: pttbBalance } = useReadContract(balanceOf, {
    contract: pttbContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  })

  const { data: halloweenBalance } = useReadContract(balanceOf, {
    contract: halloweenContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  })

  const { data: christmasBalance } = useReadContract(balanceOf, {
    contract: christmasContract,
    owner: address || "",
    queryOptions: { enabled: !!address },
  })

  const totalNFTs =
    Number(pmbcBalance || 0) + Number(pttbBalance || 0) + Number(halloweenBalance || 0) + Number(christmasBalance || 0)

  console.log("[v0] User NFTs fetched:", {
    address,
    isConnected,
    totalNFTs,
    pmbc: Number(pmbcBalance || 0),
    pttb: Number(pttbBalance || 0),
    halloween: Number(halloweenBalance || 0),
    christmas: Number(christmasBalance || 0),
  })

  return {
    totalNFTs,
    isConnected,
    collections: {
      pmbc: Number(pmbcBalance || 0),
      pttb: Number(pttbBalance || 0),
      halloween: Number(halloweenBalance || 0),
      christmas: Number(christmasBalance || 0),
    },
  }
}

// Universal Connect Wallet Component
export function UniversalConnectWallet({ className }: { className?: string }) {
  return (
    <ConnectButton
      client={client}
      theme="dark"
      connectButton={{
        label: "Connect Wallet",
        style: {
          backgroundColor: "#F59E0B",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontWeight: "600",
        },
      }}
      className={className}
    />
  )
}
