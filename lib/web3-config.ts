import { ethereum, polygon } from "thirdweb/chains"

export const COLLECTIONS = [
  {
    name: "Prime Mates Board Club",
    address: "0x12662b6a2a424a0090b7d09401fb775a9b968898",
    chainId: ethereum.id,
    chain: ethereum,
    theme: "gold",
  },
  {
    name: "Prime To The Bone",
    address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
    chainId: polygon.id,
    chain: polygon,
    theme: "red",
  },
  {
    name: "Prime Halloween",
    address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8",
    chainId: ethereum.id,
    chain: ethereum,
    theme: "orange",
  },
  {
    name: "Prime Mates Christmas Club",
    address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf",
    chainId: ethereum.id,
    chain: ethereum,
    theme: "green",
  },
]
