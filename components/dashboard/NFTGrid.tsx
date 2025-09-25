"use client";

import { useEffect, useState } from "react";
import { client } from "@/lib/thirdweb-client";
import { getContract } from "thirdweb";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";
import { NFTStakeCard } from "./NFTStakeCard";

const ETH_COLLECTIONS = [
  // "0x12662b6a2a424a0090b7d09401fb775a9b968898",
  // "0x46d5dcd9d8a9ca46e7972f53d584e14845968cf8",
];
const POLYGON_COLLECTIONS = [
  // "0x72bcde3c41c4afa153f8e7849a9cf64e2cc84e75",
  // "0xab9f149a82c6ad66c3795fbceb06ec351b13cfcf",

];

type OwnedRow = { contract: string; tokenId: string; metadata: any; chain: "ethereum" | "polygon" };

export function NFTGrid({ owner }: { owner: string }) {
  const [rows, setRows] = useState<OwnedRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!owner) return;
    let cancel = false;

    (async () => {
      setLoading(true);
      const acc: OwnedRow[] = [];
      try {
        for (const addr of ETH_COLLECTIONS) {
          const c = getContract({ client, address: addr });
          const nfts = await getOwnedNFTs({ contract: c, owner });
          for (const n of nfts) acc.push({ contract: addr, tokenId: n.id.toString(), metadata: n.metadata, chain: "ethereum" });
        }
        for (const addr of POLYGON_COLLECTIONS) {
          const c = getContract({ client, address: addr });
          const nfts = await getOwnedNFTs({ contract: c, owner });
          for (const n of nfts) acc.push({ contract: addr, tokenId: n.id.toString(), metadata: n.metadata, chain: "polygon" });
        }
      } catch (e) {
        console.error("getOwnedNFTs error", e);
      }
      if (!cancel) setRows(acc);
      setLoading(false);
    })();

    return () => { cancel = true; };
  }, [owner]);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Your NFTs</div>
        <div className="text-xs opacity-70">{loading ? "Loading…" : `${rows.length} total`}</div>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm opacity-60">No NFTs found for this wallet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {rows.map((r) => (
            <NFTStakeCard
              key={`${r.contract}-${r.tokenId}`}
              nft={{ token_id: r.tokenId, metadata: r.metadata }}
              ownerAddress={owner}
              chainLabel={r.chain}
              onUpdate={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
