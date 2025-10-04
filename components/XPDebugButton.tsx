// components/XPDebugButton.tsx
"use client";
import { Button } from "@/components/ui/button";
import { awardPoints } from "@/lib/points";
import { useActiveAccount } from "thirdweb/react";

export function XPDebugButton() {
  const acct = useActiveAccount();
  return (
    <Button
      className="mt-4"
      onClick={() => acct?.address && awardPoints(acct.address, 5, "debug")}
      disabled={!acct?.address}
    >
      +5 XP (debug)
    </Button>
  );
}
