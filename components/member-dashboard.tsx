// /components/member-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { WalletBar } from "./dashboard/WalletBar";
import { PointsCard } from "./dashboard/PointsCard";
import { ActivityList } from "./dashboard/ActivityList";
import { NFTGrid } from "./dashboard/NFTGrid";
import ChainGuard from "@/components/chain-guard";
import WalletDebug from "@/components/wallet-debug";

export function MemberDashboard() {
  const account = useActiveAccount();

  // debounce/settle the address so children never see ""
  const [owner, setOwner] = useState<string | null>(null);
  useEffect(() => {
    // only set when we actually have an address, or explicitly clear to null
    setOwner(account?.address ?? null);
  }, [account?.address]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <WalletBar />
      <ChainGuard />
      <WalletDebug />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PointsCard address={owner ?? ""} />
        <ActivityList address={owner ?? ""} />
      </div>

      {/* Don’t render the grid at all until we know if there’s an address */}
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
