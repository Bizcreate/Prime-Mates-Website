"use client"
import type { PropsWithChildren } from "react"
import { ThirdwebProvider } from "thirdweb/react"

export function Web3Provider({ children }: PropsWithChildren) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>
}

// Keep default export for compatibility
export default Web3Provider
