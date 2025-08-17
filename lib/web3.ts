import { ethers } from "ethers"

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
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/demo",
  contractAddress: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
}

const MINT_ABI = [
  "function mint(uint256 quantity) external payable",
  "function publicMint(uint256 quantity) external payable",
  "function safeMint(uint256 quantity) external payable",
  "function totalSupply() external view returns (uint256)",
  "function maxSupply() external view returns (uint256)",
  "function MAX_SUPPLY() external view returns (uint256)",
  "function mintPrice() external view returns (uint256)",
  "function price() external view returns (uint256)",
  "function cost() external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)",
]

export class Web3Service {
  private config: Web3Config
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null

  constructor(config: Web3Config = DEFAULT_CONFIG) {
    this.config = config
  }

  async connectWallet(): Promise<string> {
    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not installed")
      }

      this.provider = new ethers.BrowserProvider(window.ethereum)
      await this.provider.send("eth_requestAccounts", [])
      this.signer = await this.provider.getSigner()

      const address = await this.signer.getAddress()

      // Check if on correct network
      const network = await this.provider.getNetwork()
      if (Number(network.chainId) !== this.config.chainId) {
        await this.switchNetwork()
      }

      return address
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  async switchNetwork(): Promise<void> {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${this.config.chainId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        throw new Error("Please add Ethereum network to MetaMask")
      }
      throw error
    }
  }

  async checkNFTBalance(address: string): Promise<number> {
    try {
      if (!this.provider) {
        if (typeof window !== "undefined" && window.ethereum) {
          this.provider = new ethers.BrowserProvider(window.ethereum)
        } else {
          throw new Error("No wallet provider available")
        }
      }

      const contract = new ethers.Contract(this.config.contractAddress, MINT_ABI, this.provider)
      const balance = await contract.balanceOf(address)
      return Number(balance)
    } catch (error) {
      console.error("Failed to check NFT balance:", error)
      return 0
    }
  }

  async mintNFT(quantity: number): Promise<string | null> {
    try {
      if (!this.signer) {
        throw new Error("Wallet not connected")
      }

      const contract = new ethers.Contract(this.config.contractAddress, MINT_ABI, this.signer)

      // Try to get mint price with fallback
      let mintPrice: bigint
      try {
        mintPrice = await contract.mintPrice()
      } catch {
        try {
          mintPrice = await contract.price()
        } catch {
          try {
            mintPrice = await contract.cost()
          } catch {
            // Fallback to 0.05 ETH
            mintPrice = ethers.parseEther("0.05")
          }
        }
      }

      const totalCost = mintPrice * BigInt(quantity)

      // Try different mint function names
      let tx
      try {
        tx = await contract.mint(quantity, { value: totalCost, gasLimit: 300000 })
      } catch {
        try {
          tx = await contract.publicMint(quantity, { value: totalCost, gasLimit: 300000 })
        } catch {
          tx = await contract.safeMint(quantity, { value: totalCost, gasLimit: 300000 })
        }
      }

      console.log("[v0] Mint transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("[v0] Mint transaction confirmed:", receipt.hash)

      return receipt.hash
    } catch (error: any) {
      console.error("Failed to mint NFT:", error)

      if (error.code === "INSUFFICIENT_FUNDS") {
        throw new Error("Insufficient funds for minting")
      } else if (error.code === "USER_REJECTED") {
        throw new Error("Transaction rejected by user")
      } else if (error.message?.includes("execution reverted")) {
        throw new Error("Minting failed - check if sale is active or sold out")
      }

      throw new Error("Minting failed: " + (error.message || "Unknown error"))
    }
  }

  async getCollectionStats(): Promise<{ totalSupply: number; maxSupply: number; mintPrice: string }> {
    try {
      // Use fallback values first, then try to get real data
      const stats = { totalSupply: 1661, maxSupply: 2222, mintPrice: "0.05" }

      if (!this.provider) {
        try {
          this.provider = new ethers.BrowserProvider(window.ethereum)
        } catch {
          // If no wallet, return fallback values
          return stats
        }
      }

      const contract = new ethers.Contract(this.config.contractAddress, MINT_ABI, this.provider)

      // Try to get totalSupply
      try {
        const totalSupply = await contract.totalSupply()
        stats.totalSupply = Number(totalSupply)
      } catch (error) {
        console.log("[v0] Could not get totalSupply, using fallback")
      }

      // Try to get maxSupply with multiple function names
      try {
        const maxSupply = await contract.maxSupply()
        stats.maxSupply = Number(maxSupply)
      } catch {
        try {
          const maxSupply = await contract.MAX_SUPPLY()
          stats.maxSupply = Number(maxSupply)
        } catch (error) {
          console.log("[v0] Could not get maxSupply, using fallback")
        }
      }

      // Try to get mint price with multiple function names
      try {
        const mintPrice = await contract.mintPrice()
        stats.mintPrice = ethers.formatEther(mintPrice)
      } catch {
        try {
          const price = await contract.price()
          stats.mintPrice = ethers.formatEther(price)
        } catch {
          try {
            const cost = await contract.cost()
            stats.mintPrice = ethers.formatEther(cost)
          } catch (error) {
            console.log("[v0] Could not get mint price, using fallback")
          }
        }
      }

      return stats
    } catch (error) {
      console.error("Failed to get collection stats:", error)
      // Return known collection details as fallback
      return { totalSupply: 1661, maxSupply: 2222, mintPrice: "0.05" }
    }
  }
}

export const web3Service = new Web3Service()

declare global {
  interface Window {
    ethereum?: any
  }
}
