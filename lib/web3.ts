export interface Web3Config {
  chainId: number
  rpcUrl: string
  contractAddress: string
}

export const SUPPORTED_CHAINS = {
  ETHEREUM: 1,
  POLYGON: 137,
  BASE: 8453,
} as const

export const DEFAULT_CONFIG: Web3Config = {
  chainId: SUPPORTED_CHAINS.ETHEREUM,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "",
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
}

// Placeholder for future web3 integration
export class Web3Service {
  private config: Web3Config

  constructor(config: Web3Config = DEFAULT_CONFIG) {
    this.config = config
  }

  // TODO: Implement web3 methods for NFT interactions
  async connectWallet(): Promise<string | null> {
    // Implementation will be added for web3 integration
    return null
  }

  async checkNFTBalance(address: string): Promise<number> {
    // Implementation will be added for web3 integration
    return 0
  }

  async mintNFT(to: string, tokenId: string): Promise<string | null> {
    // Implementation will be added for web3 integration
    return null
  }
}

export const web3Service = new Web3Service()
