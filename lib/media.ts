// lib/media.ts
import { createThirdwebClient } from "thirdweb";
import { resolveScheme } from "thirdweb/storage";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// Gateways that behave well in in-app browsers (Phantom, etc.)
const IPFS_GWS = [
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
];

export function resolveNftImageUrl(raw?: string | null): string | null {
  if (!raw) return null;

  // Use thirdweb resolver first
  try {
    const u = resolveScheme({ uri: raw, client });
    if (u) return u;
  } catch {}

  // IPFS
  if (raw.startsWith("ipfs://")) {
    const path = raw.slice("ipfs://".length);
    return IPFS_GWS[0] + path;
  }

  // Arweave
  if (raw.startsWith("ar://")) {
    return "https://arweave.net/" + raw.slice("ar://".length);
  }

  if (/^https?:\/\//i.test(raw)) return raw;
  return null;
}

// Alias so your existing imports keep working
export const resolveMediaUrl = resolveNftImageUrl;

export function extractImageFromMetadata(metadata: any): string | null {
  if (!metadata) return null;
  const direct = metadata.image || metadata.image_url || metadata.imageUrl;
  if (direct) return String(direct);
  if (metadata.properties?.image) return String(metadata.properties.image);
  return null;
}

// Optional: wrap any resolved URL via your domain to avoid in-app CORS
export function proxyImage(url: string | null): string | null {
  if (!url) return null;
  if (typeof window === "undefined") return url;
  const u = new URL("/api/proxy-image", window.location.origin);
  u.searchParams.set("u", url);
  return u.toString();
}
