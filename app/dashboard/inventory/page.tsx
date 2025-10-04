"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { WalletBar } from "@/components/dashboard/WalletBar";
import { NFTGrid } from "@/components/dashboard/NFTGrid";

export default function InventoryPage() {
  const account = useActiveAccount();
  const [owner, setOwner] = useState<string | null>(null);

  useEffect(() => {
    setOwner(account?.address ?? null);
  }, [account?.address]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <WalletBar />

      {owner === null ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-300">
          Checking wallet…
        </div>
      ) : owner ? (
        <NFTGrid owner={owner} />
      ) : (
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-sm text-gray-300">
          Connect your wallet to view your NFTs.
        </div>
      )}
    </div>
  );
}
