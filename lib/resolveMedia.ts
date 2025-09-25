// lib/resolveMedia.ts
export function resolveMediaUrl(raw?: string | null): string | null {
    if (!raw) return null;
    const url = raw.trim();
  
    // Data URIs are fine
    if (url.startsWith("data:")) return url;
  
    // IPFS (various forms)
    if (url.startsWith("ipfs://")) {
      const p = url.replace("ipfs://", "");
      // Prefer thirdweb’s fast CDN gateway
      return `https://ipfs.thirdwebcdn.com/ipfs/${p.replace(/^ipfs\//, "")}`;
    }
    if (url.includes("/ipfs/")) {
      // e.g. https://gateway.pinata.cloud/ipfs/...
      const cidPath = url.split("/ipfs/")[1];
      return `https://ipfs.thirdwebcdn.com/ipfs/${cidPath}`;
    }
  
    // Arweave
    if (url.startsWith("ar://")) {
      return `https://arweave.net/${url.replace("ar://", "")}`;
    }
  
    // HTTP(S) already — return as-is
    return url;
  }
  
  /** Wrap any resolved URL with our proxy (for CORS/referrer safety) */
  export function proxiedMediaUrl(resolved: string | null): string | null {
    if (!resolved) return null;
    // Keep data URIs direct
    if (resolved.startsWith("data:")) return resolved;
    return `/api/proxy-image?url=${encodeURIComponent(resolved)}`;
  }
  