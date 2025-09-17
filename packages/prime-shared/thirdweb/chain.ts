import { base, polygon, sepolia, ethereum } from "thirdweb/chains";

export function resolveChain() {
  const name = (process.env.NEXT_PUBLIC_CHAIN || "sepolia").toLowerCase();
  switch (name) {
    case "base": return base;
    case "polygon":
    case "matic": return polygon;
    case "ethereum":
    case "mainnet": return ethereum;
    default: return sepolia;
  }
}
