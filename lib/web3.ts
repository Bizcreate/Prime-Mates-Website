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
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
]

export const PRIME_MATES_CONTRACTS = {
  PMBC: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
  PRIME_TO_THE_BONE: "0x", // Add the actual contract address when available
} as const

export interface NFTMetadata {
  id: string
  name: string
  image: string
  tokenId: number
  collection: string
  rarity?: string
  contractAddress: string
}

export interface NFTTokenData {
  tokenId: string
  name: string
  image: string
  description?: string
  attributes?: Array<{ trait_type: string; value: string }>
  owner?: string
}

export class Web3Service {
  private config: Web3Config
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null

  constructor(config: Web3Config = DEFAULT_CONFIG) {
    this.config = config
  }

  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  private detectWalletProvider(): any {
    if (typeof window === "undefined") return null

    // Check for MetaMask first
    if (window.ethereum?.isMetaMask) {
      return window.ethereum
    }

    // Check for other wallet providers
    if (window.ethereum) {
      return window.ethereum
    }

    // Check for Trust Wallet
    if (window.trustWallet) {
      return window.trustWallet
    }

    // Check for Coinbase Wallet
    if (window.coinbaseWalletExtension) {
      return window.coinbaseWalletExtension
    }

    return null
  }

  async connectWallet(): Promise<string> {
    try {
      console.log("[v0] Starting wallet connection...")

      if (typeof window === "undefined") {
        throw new Error("Browser environment required for wallet connection")
      }

      const walletProvider = this.detectWalletProvider()

      if (!walletProvider) {
        if (this.isMobile()) {
          // On mobile, provide instructions for different wallet apps
          throw new Error(
            "Please open this page in your mobile wallet app (MetaMask, Trust Wallet, or Coinbase Wallet)",
          )
        } else {
          throw new Error("No wallet detected. Please install MetaMask, Trust Wallet, or Coinbase Wallet")
        }
      }

      console.log("[v0] Wallet provider detected, creating provider...")
      this.provider = new ethers.BrowserProvider(walletProvider)

      console.log("[v0] Requesting account access...")
      await this.provider.send("eth_requestAccounts", [])

      console.log("[v0] Getting signer...")
      this.signer = await this.provider.getSigner()

      const address = await this.signer.getAddress()
      console.log("[v0] Connected to address:", address)

      // Check if on correct network
      const network = await this.provider.getNetwork()
      console.log("[v0] Current network:", Number(network.chainId))

      if (Number(network.chainId) !== this.config.chainId) {
        console.log("[v0] Switching to correct network...")
        await this.switchNetwork()
      }

      console.log("[v0] Wallet connection successful!")
      return address
    } catch (error: any) {
      console.error("[v0] Wallet connection failed:", error)

      if (error.code === 4001) {
        throw new Error("Connection rejected by user")
      } else if (error.code === -32002) {
        throw new Error("Connection request already pending. Please check your wallet app.")
      } else if (error.message?.includes("User rejected")) {
        throw new Error("Connection rejected by user")
      } else if (error.message?.includes("open this page in your mobile wallet")) {
        throw error // Pass through mobile-specific error
      } else if (error.message?.includes("No wallet detected")) {
        throw error // Pass through wallet detection error
      }

      // Fallback error message
      const errorMessage = error.message || "Unknown wallet connection error"
      throw new Error(`Failed to connect wallet: ${errorMessage}`)
    }
  }

  async switchNetwork(): Promise<void> {
    try {
      console.log("[v0] Attempting to switch network...")
      const walletProvider = this.detectWalletProvider()

      if (!walletProvider) {
        throw new Error("No wallet provider available")
      }

      await walletProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${this.config.chainId.toString(16)}` }],
      })
      console.log("[v0] Network switch successful")
    } catch (error: any) {
      console.error("[v0] Network switch failed:", error)
      if (error.code === 4902) {
        // Network not added to wallet
        throw new Error("Please add Ethereum network to your wallet")
      }
      throw new Error(`Failed to switch network: ${error.message || "Unknown error"}`)
    }
  }

  async checkNFTBalance(address: string): Promise<number> {
    try {
      if (!this.provider) {
        const walletProvider = this.detectWalletProvider()
        if (walletProvider) {
          this.provider = new ethers.BrowserProvider(walletProvider)
        } else {
          // Use public RPC for read-only operations
          this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl)
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
          const walletProvider = this.detectWalletProvider()
          if (walletProvider) {
            this.provider = new ethers.BrowserProvider(walletProvider)
          }
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

  async getUserNFTs(address: string): Promise<NFTMetadata[]> {
    try {
      console.log("[v0] Starting NFT fetch for address:", address)
      const nfts: NFTMetadata[] = []

      if (!this.provider) {
        const walletProvider = this.detectWalletProvider()
        if (walletProvider) {
          this.provider = new ethers.BrowserProvider(walletProvider)
          console.log("[v0] Created new provider")
        } else {
          // Use public RPC for read-only operations
          this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl)
        }
      }

      console.log("[v0] Checking PMBC contract:", PRIME_MATES_CONTRACTS.PMBC)
      try {
        const pmbc_nfts = await this.fetchNFTsFromContract(
          address,
          PRIME_MATES_CONTRACTS.PMBC,
          "Prime Mates Board Club",
        )
        console.log("[v0] PMBC NFTs found:", pmbc_nfts.length)
        nfts.push(...pmbc_nfts)
      } catch (error) {
        console.error("[v0] Error fetching PMBC NFTs:", error)
      }

      const manualBalance = await this.checkNFTBalance(address)
      console.log("[v0] Manual balance check result:", manualBalance)

      if (manualBalance > 0 && nfts.length === 0) {
        console.log("[v0] Creating placeholder NFTs based on balance")
        for (let i = 0; i < manualBalance; i++) {
          nfts.push({
            id: `pmbc-${i + 1}`,
            name: `Prime Mates Board Club #${i + 1}`,
            image:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pmbc1.GIF-2YlHT4ki8pFi2FuczRbVv9KvZrgEG2.gif",
            tokenId: i + 1,
            collection: "Prime Mates Board Club",
            rarity: "Verified Owner",
            contractAddress: PRIME_MATES_CONTRACTS.PMBC,
          })
        }
      }

      console.log("[v0] Final NFT count:", nfts.length)
      return nfts
    } catch (error) {
      console.error("[v0] Failed to fetch user NFTs:", error)
      return []
    }
  }

  private async fetchNFTsFromContract(
    address: string,
    contractAddress: string,
    collectionName: string,
  ): Promise<NFTMetadata[]> {
    try {
      console.log("[v0] Fetching from contract:", contractAddress, "for collection:", collectionName)
      const contract = new ethers.Contract(contractAddress, MINT_ABI, this.provider!)

      let balance: bigint
      try {
        balance = await contract.balanceOf(address)
        console.log("[v0] Raw balance result:", balance.toString())
      } catch (error) {
        console.error("[v0] Error calling balanceOf:", error)
        return []
      }

      const balanceNum = Number(balance)
      console.log("[v0] User has", balanceNum, "NFTs in", collectionName)

      if (balanceNum === 0) {
        return []
      }

      const nfts: NFTMetadata[] = []

      for (let i = 0; i < balanceNum; i++) {
        nfts.push({
          id: `${contractAddress}-${i + 1}`,
          name: `${collectionName} #${i + 1}`,
          image:
            collectionName === "Prime Mates Board Club"
              ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pmbc1.GIF-2YlHT4ki8pFi2FuczRbVv9KvZrgEG2.gif"
              : "/placeholder.svg?height=200&width=200",
          tokenId: i + 1,
          collection: collectionName,
          rarity: "Verified Owner",
          contractAddress,
        })
      }

      console.log("[v0] Created", nfts.length, "NFT records for", collectionName)
      return nfts
    } catch (error) {
      console.error("[v0] Failed to fetch NFTs from contract:", contractAddress, error)
      return []
    }
  }

  async fetchNFTByTokenId(contractAddress: string, tokenId: number): Promise<NFTTokenData | null> {
    try {
      console.log("[v0] Fetching NFT", tokenId, "from contract", contractAddress)

      if (!this.provider) {
        const walletProvider = this.detectWalletProvider()
        if (walletProvider) {
          this.provider = new ethers.BrowserProvider(walletProvider)
        } else {
          // Use public RPC for read-only operations
          this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl)
        }
      }

      const contract = new ethers.Contract(contractAddress, MINT_ABI, this.provider)

      // Check if token exists
      try {
        const owner = await contract.ownerOf(tokenId)
        console.log("[v0] Token", tokenId, "owned by:", owner)
      } catch (error) {
        console.log("[v0] Token", tokenId, "does not exist or not minted yet")
        return null
      }

      // Try to get token URI
      let tokenURI = ""
      try {
        tokenURI = await contract.tokenURI(tokenId)
        console.log("[v0] Token URI:", tokenURI)
      } catch (error) {
        console.log("[v0] Could not get token URI for", tokenId)
      }

      // If we have a token URI, try to fetch metadata
      if (tokenURI) {
        try {
          // Handle IPFS URLs
          if (tokenURI.startsWith("ipfs://")) {
            tokenURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
          }

          const response = await fetch(tokenURI)
          const metadata = await response.json()

          return {
            tokenId: tokenId.toString(),
            name: metadata.name || `Token #${tokenId}`,
            image: metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || "/abstract-nft-concept.png",
            description: metadata.description,
            attributes: metadata.attributes || [],
          }
        } catch (error) {
          console.log("[v0] Could not fetch metadata from URI:", error)
        }
      }

      return {
        tokenId: tokenId.toString(),
        name: `Token #${tokenId}`,
        image: "/abstract-nft-concept.png",
        description: `NFT #${tokenId} from this collection`,
        attributes: [{ trait_type: "Status", value: "Minted" }],
      }
    } catch (error) {
      console.error("[v0] Error fetching NFT by token ID:", error)
      return null
    }
  }

  async fetchCollectionNFTs(contractAddress: string, startId = 1, count = 12): Promise<NFTTokenData[]> {
    try {
      console.log("[v0] Fetching", count, "NFTs from collection", contractAddress)

      if (!this.provider) {
        const walletProvider = this.detectWalletProvider()
        if (walletProvider) {
          this.provider = new ethers.BrowserProvider(walletProvider)
        } else {
          // Use public RPC for read-only operations
          this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl)
        }
      }

      const contract = new ethers.Contract(contractAddress, MINT_ABI, this.provider)
      const nfts: NFTTokenData[] = []

      // Get total supply to know valid range
      let totalSupply = 0
      try {
        const supply = await contract.totalSupply()
        totalSupply = Number(supply)
        console.log("[v0] Collection total supply:", totalSupply)
      } catch (error) {
        console.log("[v0] Could not get total supply, using fallback")
        totalSupply = 100 // Fallback
      }

      const tokenIds: number[] = []
      for (let i = 1; i <= Math.min(count, totalSupply, 50); i++) {
        tokenIds.push(i)
      }

      // Fetch each NFT
      for (const tokenId of tokenIds) {
        try {
          const nft = await this.fetchNFTByTokenId(contractAddress, tokenId)
          if (nft) {
            nfts.push(nft)
          }
        } catch (error) {
          console.log("[v0] Failed to fetch token", tokenId, "continuing...")
          continue
        }
      }

      console.log("[v0] Successfully fetched", nfts.length, "NFTs")
      return nfts
    } catch (error) {
      console.error("[v0] Error fetching collection NFTs:", error)
      return []
    }
  }
}

export const web3Service = new Web3Service()

declare global {
  interface Window {
    ethereum?: any
    trustWallet?: any
    coinbaseWalletExtension?: any
  }
}
