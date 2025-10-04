"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, ExternalLink } from "lucide-react";

import { ethereum, polygon } from "thirdweb/chains";
import { Insight } from "thirdweb";
import { thirdwebClient } from "@/packages/prime-shared/thirdweb/client";

type Props = {
  owner: string; // settled address ("" if not connected)
};

type NFTData = {
  tokenId: string;
  name: string;
  image: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  tokenAddress?: string;
  chainId?: number;
  collection?: string;
};

const IPFS = ["https://ipfs.io/ipfs/", "https://cloudflare-ipfs.com/ipfs/", "https://nftstorage.link/ipfs/"];
const ipfsToHttp = (u?: string) => (u?.startsWith("ipfs://") ? `${IPFS[0]}${u.replace("ipfs://", "")}` : u);
const pickImage = (m: any) =>
  ipfsToHttp(m?.image) ||
  ipfsToHttp(m?.image_url) ||
  ipfsToHttp(m?.imageURI) ||
  ipfsToHttp(m?.animation_url) ||
  "/prime-mates-nft.jpg";

const collections = [
  { name: "Prime Mates Board Club", address: "0x12662b6a2a424a0090b7d09401fb775a9b968898", chainId: 1 },
  { name: "Prime To The Bone",      address: "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75", chainId: 137 },
  { name: "Prime Halloween",        address: "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8", chainId: 1 },
  { name: "Prime Mates Christmas Club", address: "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf", chainId: 137 },
] as const;

const openSeaUrl = (chainId: number, contract: string, tokenId: string | number) => {
  const base = chainId === 1 ? "ethereum" : "matic";
  return `https://opensea.io/assets/${base}/${contract}/${tokenId}`;
};

export function NFTGrid({ owner }: Props) {
  const [items, setItems] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string>("");

  const byAddr = useMemo(
    () => Object.fromEntries(collections.map((c) => [c.address.toLowerCase(), c])),
    [],
  );

  async function load() {
    if (!owner) {
      setItems([]);
      setNotice("");
      return;
    }
    setLoading(true);
    setNotice("");
    try {
      const owned = await Insight.getOwnedNFTs({
        client: thirdwebClient,
        chains: [ethereum, polygon],
        ownerAddress: owner,
        contractAddresses: collections.map((c) => c.address),
        includeMetadata: true,
        queryOptions: { resolve_metadata_links: "true", limit: 500 },
      });

      const mapped: NFTData[] = owned.map((n) => {
        const meta = n.metadata || {};
        const info = byAddr[n.tokenAddress.toLowerCase()];
        return {
          tokenId: n.id.toString(),
          name: meta.name || `${info?.name ?? "Token"} #${n.id.toString()}`,
          image: pickImage(meta),
          description: meta.description,
          attributes: Array.isArray(meta.attributes) ? meta.attributes : [],
          tokenAddress: n.tokenAddress,
          chainId: n.chainId,
          collection: info?.name,
        };
      });

      // sort by collection then tokenId
      mapped.sort((a, b) =>
        (a.collection || "").localeCompare(b.collection || "") ||
        Number(a.tokenId) - Number(b.tokenId),
      );

      setItems(mapped);
    } catch (err: any) {
      console.error("[dashboard] load NFTs error", err);
      if (err?.message?.includes("Unauthorized domain")) {
        setNotice("Preview domain not authorized by thirdweb. You’ll see NFTs after deploy domain is allowed.");
      } else {
        setNotice("Failed to load NFTs. Please try again.");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);

  if (!owner) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-300">
        Connect your wallet to view your NFTs.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Prime NFTs</h3>
        <Button size="sm" variant="ghost" onClick={load} className="text-gray-300 hover:text-white">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {notice && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          {notice}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-12 text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading your NFTs…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-yellow-200">
          No NFTs found for this wallet across your configured collections.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((nft) => (
            <Card key={`${nft.tokenAddress}-${nft.tokenId}`} className="bg-gray-900 border-gray-800 hover:border-yellow-500 transition">
              <CardContent className="p-4">
                <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-800">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="h-full w-full object-cover"
                    onError={(e) => ((e.target as HTMLImageElement).src = "/prime-mates-nft.jpg")}
                  />
                </div>
                <div className="mb-2 font-semibold">{nft.name}</div>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-800 text-gray-300">#{nft.tokenId}</Badge>
                  {nft.collection ? (
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300">{nft.collection}</Badge>
                  ) : null}
                </div>
                {nft.tokenAddress && nft.chainId ? (
                  <a
                    href={openSeaUrl(nft.chainId, nft.tokenAddress, nft.tokenId)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-sm text-yellow-400 hover:underline"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    View on OpenSea
                  </a>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
