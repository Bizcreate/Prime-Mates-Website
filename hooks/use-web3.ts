"use client"

import { useState } from "react"
import { web3Service } from "@/lib/web3"

export interface Web3State {
  account: string | null
  isConnected: boolean
  isLoading: boolean
  chainId: number | null
  balance: string | null
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    account: null,
    isConnected: false,
    isLoading: false,
    chainId: null,
    balance: null,
  })

  const connect = async () => {
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const account = await web3Service.connectWallet()
      setState((prev) => ({
        ...prev,
        account,
        isConnected: !!account,
        isLoading: false,
      }))
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  const disconnect = () => {
    setState({
      account: null,
      isConnected: false,
      isLoading: false,
      chainId: null,
      balance: null,
    })
  }

  return {
    ...state,
    connect,
    disconnect,
  }
}
