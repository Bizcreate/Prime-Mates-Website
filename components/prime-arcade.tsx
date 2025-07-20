"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

const PrimeArcade = () => {
  const [account, setAccount] = useState<string | null>(null)

  const connect = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to continue.",
      })
      return
    }

    try {
      const accounts: string[] = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      })
      setAccount(accounts[0])
      toast({
        title: "Wallet connected",
        description: `${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}`,
      })
    } catch (err: any) {
      console.error("MetaMask connection failed:", err)
      toast({
        title: "Failed to connect",
        description:
          err?.message === "User rejected the request."
            ? "Connection request was rejected."
            : "Could not connect to MetaMask.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h1>Prime Arcade</h1>
      {account ? <p>Connected: {account}</p> : <Button onClick={connect}>Connect Wallet</Button>}
    </div>
  )
}

export { PrimeArcade } // 👈 named export for `import { PrimeArcade } ...`
export default PrimeArcade // (keeps the existing default export)
