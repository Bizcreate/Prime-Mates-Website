"use client";

import { useActiveAccount, useActiveWallet, useChain, useSwitchActiveChain } from "thirdweb/react";
import { supportedChains } from "@/lib/thirdweb";
import { Button } from "@/components/ui/button";

export default function ChainGuard() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { chain } = useChain();
  const { switchActiveChain, isPending } = useSwitchActiveChain();

  // not connected? nothing to show.
  if (!account || !wallet) return null;

  const isSupported = !!supportedChains.find((c) => c.id === chain?.id);
  if (isSupported) return null;

  return (
    <div className="rounded-lg border border-yellow-600/40 bg-yellow-500/10 p-3 text-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        You’re connected to an unsupported network. Pick a supported chain:
      </div>
      <div className="flex gap-2">
        {supportedChains.map((c) => (
          <Button
            key={c.id}
            size="sm"
            variant="outline"
            onClick={() => switchActiveChain(c)}
            disabled={isPending}
          >
            Switch to {c.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
