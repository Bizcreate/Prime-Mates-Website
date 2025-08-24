import { createConfig, http } from "wagmi"
import { mainnet, polygon } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const config = createConfig({
  chains: [mainnet, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
  },
})

export const PRIME_MATES_CONTRACTS = {
  PMBC: {
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898" as const,
    chainId: mainnet.id,
  },
  PRIME_TO_THE_BONE: {
    address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75" as const,
    chainId: polygon.id,
  },
  PRIME_HALLOWEEN: {
    address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8" as const,
    chainId: mainnet.id,
  },
  PRIME_CHRISTMAS: {
    address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf" as const,
    chainId: polygon.id,
  },
} as const

export const ERC721_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "quantity", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const

export const COLLECTIONS = {
  "Prime Mates Board Club": {
    name: "Prime Mates Board Club",
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
    chainId: mainnet.id,
    theme: "yellow",
    supply: 2222,
  },
  "Prime to the Bone": {
    name: "Prime to the Bone",
    address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
    chainId: polygon.id,
    theme: "green",
    supply: 999,
  },
  "Prime Halloween": {
    name: "Prime Halloween",
    address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8",
    chainId: mainnet.id,
    theme: "orange",
    supply: 666,
  },
  "Prime Mates Christmas Club": {
    name: "Prime Mates Christmas Club",
    address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf",
    chainId: polygon.id,
    theme: "red",
    supply: 1111,
  },
} as const
