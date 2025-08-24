import { defineChain } from "thirdweb"

export const ethereum = defineChain(1)
export const polygon = defineChain(137)

export const supportedChains = [ethereum, polygon]

export const COLLECTION_CONTRACTS = {
  "prime-mates-board-club": {
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
    chain: ethereum,
    name: "Prime Mates Board Club",
    symbol: "PMBC",
  },
  "prime-to-the-bone": {
    address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
    chain: polygon,
    name: "Prime To The Bone",
    symbol: "PTTB",
  },
  "prime-halloween": {
    address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8",
    chain: ethereum,
    name: "Prime Halloween",
    symbol: "PMHW",
  },
  "prime-christmas": {
    address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf",
    chain: polygon,
    name: "Prime Mates Christmas Club",
    symbol: "PMCC",
  },
}
