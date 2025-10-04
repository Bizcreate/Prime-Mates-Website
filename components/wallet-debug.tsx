"use client";

import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";

export default function WalletDebug() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();

  return (
    <pre className="mb-4 overflow-auto rounded-md border border-gray-800 bg-gray-900 p-3 text-xs text-gray-300">
      {JSON.stringify(
        {
          connected: !!account,
          address: account?.address ?? null,
          chain: chain ? { id: chain.id, name: chain.name } : null,
        },
        null,
        2,
      )}
    </pre>
  );
}
