import { parseEther } from "viem"

export type CollectionKey = "pmbc" | "pttb"

export const COLLECTIONS: Record<
  CollectionKey,
  {
    name: string
    address: `0x${string}`
    chain: "mainnet" | "polygon"
    unitPriceWei?: bigint
    mintMethod?: string
  }
> = {
  pmbc: {
    name: "Prime Mates Board Club",
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898", // Real PMBC contract
    chain: "polygon",
    unitPriceWei: parseEther("0.05"),
    mintMethod: "function mint(uint256 quantity) payable",
  },
  pttb: {
    name: "Prime To The Bone",
    address: "0x72bcde3c2cb9b2a2e74e0a2d5d6b8a3d2cc84e75", // Real PTTB contract
    chain: "mainnet",
    unitPriceWei: parseEther("85"),
    mintMethod: "function mint(uint256 quantity) payable",
  },
}

export const STAKING = {
  address: "0x0000000000000000000000000000000000000000" as `0x${string}`, // TODO: Add real staking contract
  chain: "polygon" as const,
  stakeMethod: "function stake(uint256[] tokenIds)",
  unstakeMethod: "function unstake(uint256[] tokenIds)",
  claimMethod: "function claim()",
}
