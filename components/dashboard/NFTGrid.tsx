"use client";

import { useEffect, useMemo, useState } from "react";
import { getContract } from "thirdweb";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { ethereum, polygon } from "thirdweb/chains";
import { client } from "@/lib/thirdweb"; // your central thirdweb client export
import { NFTStakeCard } from "./NFTStakeCard";
import { resolveMediaUrl } from "@/lib/media";

type OwnedNFT = {
  id: string;
  name: string;
  image: string | null;
  contract: string;
  chain: "ethereum" | "polygon";
  tokenId: string;
  raw: any;
};

const ETH_COLLECTIONS: string[] = [
  // add your Ethereum ERC-721 contract addresses here
  // "0xYourEthCollectionAddress"
];

const POLYGON_COLLECTIONS: string[] = [
  // add your Polygon ERC-721 contract addresses here
  // "0xYourPolygonCollectionAddress"
];

export function NFTGrid({ owner }: { owner: string }) {
  const [items, setItems] = useState<OwnedNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const connected = owner && owner.length > 0;

  const collections = useMemo(
    () => [
      ...ETH_COLLECTIONS.map((addr) => ({ addr, chain: ethereum, chainKey: "ethereum" as const })),
      ...POLYGON_COLLECTIONS.map((addr) => ({ addr, chain: polygon, chainKey: "polygon" as const })),
    ],
    []
  );

  useEffect(() => {
    let abort = false;

    async function load() {
      if (!connected) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const out: OwnedNFT[] = [];

        for (const c of collections) {
          try {
            const contract = getContract({ client, chain: c.chain, address: c.addr });
            const res = await getOwnedNFTs({ contract, owner, count: 100 });

            for (const n of res) {
              const name =
                (n.metadata as any)?.name ??
                `#${n.id}`;
              const img = resolveMediaUrl((n.metadata as any)?.image) ?? null;

              out.push({
                id: `${c.addr}:${String(n.id)}`,
                name,
                image: img,
                contract: c.addr,
                chain: c.chainKey,
                tokenId: String(n.id),
                raw: n,
              });
            }
          } catch (e) {
            // ignore one collection failing; continue others
            // console.debug("NFT load error for", c.addr, e);
          }
        }

        if (!abort) setItems(out);
      } finally {
        if (!abort) setLoading(false);
      }
    }

    load();
    return () => {
      abort = true;
    };
  }, [owner, connected, collections]);

  if (!connected) {
    return (
      <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/60">
        <div className="text-sm opacity-70">Connect your wallet to view your NFTs.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/60">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" />
          <div className="text-sm">Loading your NFTs…</div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-gray-800 p-4 bg-gray-900/60">
        <div className="text-sm opacity-70">No NFTs found for this wallet across your configured collections.</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((nft) => (
        <NFTStakeCard
          key={nft.id}
          nft={{
            token_id: nft.tokenId,
            metadata: {
              name: nft.name,
              image: nft.image ?? "/placeholder.png",
            },
          }}
          chainType={nft.chain === "ethereum" ? "ethereum" : "polygon"}
          onUpdate={() => {/* no-op; hook up to refresh if needed */}}
        />
      ))}
    </div>
  );
}

export default NFTGrid;
