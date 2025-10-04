// /components/member-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { WalletBar } from "./dashboard/WalletBar";
import { PointsCard } from "./dashboard/PointsCard";
import { ActivityList } from "./dashboard/ActivityList";
import ChainGuard from "@/components/chain-guard";
import { NFTGrid } from "./dashboard/NFTGrid";
// inside components/member-dashboard.tsx (near the top section)
import Link from "next/link";
import { Button } from "@/components/ui/button";

{/* actions row */}
<div className="flex gap-3">
  <Link href="/dashboard/inventory">
    <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
      View Inventory
    </Button>
  </Link>
  <Link href="/#prime-arcade">
    <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
      Launch Prime Arcade
    </Button>
  </Link>
</div>


export function MemberDashboard() {
  const account = useActiveAccount();

  // debounce/settle the address so children never see ""
  const [owner, setOwner] = useState<string | null>(null);
  useEffect(() => {
    setOwner(account?.address ?? null);
  }, [account?.address]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <WalletBar />
      <ChainGuard />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PointsCard address={owner ?? ""} />
        <ActivityList address={owner ?? ""} />
      </div>

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
