"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { Insight } from "thirdweb";
import { ethereum, polygon } from "thirdweb/chains";
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client";

type NFTData = {
  tokenId: string;
  name: string;
  image: string;
  description?: string;
  tokenAddress?: string;
  chainId?: number;
};

// ── Prime collections (exactly these 4) ────────────────────────────────────────
const PRIME_COLLECTIONS = [
  { name: "Prime Mates Board Club",      address: "0x12662b6a2a424a0090b7d09401fb775a9b968898", chainId: 1 },
  { name: "Prime To The Bone",           address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75", chainId: 137 },
  { name: "Prime Halloween",             address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8", chainId: 1 },
  { name: "Prime Mates Christmas Club",  address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf", chainId: 137 },
] as const;

const PRIME_ADDR_SET = new Set(PRIME_COLLECTIONS.map(c => c.address.toLowerCase()));

const IPFS = (u?: string) =>
  u?.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${u.replace("ipfs://", "")}` : u;

function pickImage(meta: any) {
  return (
    IPFS(meta?.image) ||
    IPFS(meta?.image_url) ||
    IPFS(meta?.imageURI) ||
    IPFS(meta?.animation_url) ||
    "/prime-mates-nft.jpg"
  );
}

function openSeaUrl(chainId?: number, contract?: string, tokenId?: string) {
  if (!chainId || !contract || !tokenId) return undefined;
  const base = chainId === 1 ? "ethereum" : "matic";
  return `https://opensea.io/assets/${base}/${contract}/${tokenId}`;
}

export function NFTGrid({ owner }: { owner: string }) {
  const [items, setItems] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);

  const chains = useMemo(() => [ethereum, polygon], []);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!owner) return;
      setLoading(true);
      try {
        // Query ONLY our contracts
        const res = await Insight.getOwnedNFTs({
          client: thirdwebClient,
          chains,
          ownerAddress: owner,
          contractAddresses: PRIME_COLLECTIONS.map(c => c.address),
          includeMetadata: true,
          queryOptions: { resolve_metadata_links: "true", limit: 300 },
        });

        if (!mounted) return;

        // Double-guard filter (in case API returns extras)
        const filtered = res.filter(n =>
          n.tokenAddress && PRIME_ADDR_SET.has(n.tokenAddress.toLowerCase()),
        );

        const mapped: NFTData[] = filtered.map((n) => ({
          tokenId: n.id.toString(),
          name:
            n.metadata?.name ||
            `${n.tokenAddress.slice(0, 6)}…${n.tokenAddress.slice(-4)} #${n.id}`,
          image: pickImage(n.metadata),
          description: n.metadata?.description,
          tokenAddress: n.tokenAddress,
          chainId: n.chainId,
        }));
        setItems(mapped);
      } catch (e) {
        console.error("[NFTGrid] load error:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [owner, chains]);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin inline-block mr-2 text-yellow-500" />
        <span className="text-sm text-gray-300">Loading your Prime NFTs…</span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-300">
        No Prime NFTs found in this wallet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">Your Prime NFTs</div>
        <Badge variant="secondary" className="bg-gray-800">{items.length}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((nft) => {
          const link = openSeaUrl(nft.chainId, nft.tokenAddress, nft.tokenId);
          return (
            <Card
              key={`${nft.tokenAddress}-${nft.tokenId}`}
              className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition-all duration-300"
            >
              <CardContent className="p-3">
                <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")
                    }
                  />
                </div>
                <div className="font-semibold text-sm truncate">{nft.name}</div>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="secondary" className="bg-gray-800 text-[10px]">
                    #{nft.tokenId}
                  </Badge>
                  {link && (
                    <a href={link} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" className="h-7 px-2">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default NFTGrid;
