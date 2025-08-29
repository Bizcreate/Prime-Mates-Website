import { parseEther } from "viem"

export type CollectionKey = "pmbc" | "pttb"

export const COLLECTIONS: Record<
  CollectionKey,
  {
    name: string
    address: `0x${string}`
    chain: "mainnet" | "polygon"
    chainId: number // Add chainId for easier chain identification
    unitPriceWei?: bigint
    mintMethod?: string
  }
> = {
  pmbc: {
    name: "Prime Mates Board Club",
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
    chain: "mainnet",
    chainId: 1, // Changed to Ethereum mainnet chain ID
    unitPriceWei: parseEther("0.05"),
    mintMethod: "function mint(uint256 quantity) payable",
  },
  pttb: {
    name: "Prime To The Bone",
    address: "0x72bcde3c2cb9b2a2e74e0a2d5d6b8a3d2cc84e75",
    chain: "polygon",
    chainId: 137, // Changed to Polygon chain ID
    unitPriceWei: parseEther("85"),
    mintMethod: "function mint(uint256 quantity) payable",
  },
}

export const CONTRACTS = {
  PMBC: {
    address: COLLECTIONS.pmbc.address,
    chain: COLLECTIONS.pmbc.chain,
    chainId: COLLECTIONS.pmbc.chainId,
  },
  PTTB: {
    address: COLLECTIONS.pttb.address,
    chain: COLLECTIONS.pttb.chain,
    chainId: COLLECTIONS.pttb.chainId,
  },
}

export const STAKING = {
  address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  chain: "polygon" as const,
  chainId: 137, // Add chain ID for staking
  stakeMethod: "function stake(uint256[] tokenIds)",
  unstakeMethod: "function unstake(uint256[] tokenIds)",
  claimMethod: "function claim()",
}

export const SUPPORTED_CHAINS = {
  1: { name: "Ethereum", symbol: "ETH", rpc: "https://ethereum.publicnode.com" },
  137: { name: "Polygon", symbol: "MATIC", rpc: "https://polygon.publicnode.com" },
  8453: { name: "Base", symbol: "ETH", rpc: "https://base.publicnode.com" },
  42161: { name: "Arbitrum", symbol: "ETH", rpc: "https://arbitrum.publicnode.com" },
} as const
