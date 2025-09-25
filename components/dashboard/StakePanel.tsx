"use client";

import { useState } from "react";
import { client } from "@/lib/thirdweb-client";
import { getContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { activityCol } from "@/lib/points";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STAKING_CONTRACT = "0xYourStakingContract"; // TODO

export function StakePanel() {
  const account = useActiveAccount();
  const [tokenId, setTokenId] = useState<string>("");

  async function logActivity(type: "stake" | "unstake", tokenId: string) {
    if (!account?.address) return;
    await addDoc(activityCol(account.address), {
      type,
      tokenId,
      at: serverTimestamp(),
    });
  }

  async function onStake() {
    if (!account?.address || !tokenId) return;

    try {
      const c = getContract({ client, address: STAKING_CONTRACT });
      // TODO: call your contract write (examples)
      // await writeContract({ contract: c, method: "stake", params: [tokenId] })
      console.log("stake =>", tokenId, "by", account.address);

      await logActivity("stake", tokenId);
      alert(`Staked token #${tokenId}`);
      setTokenId("");
    } catch (e) {
      console.error(e);
      alert("Stake failed — see console");
    }
  }

  async function onUnstake() {
    if (!account?.address || !tokenId) return;

    try {
      const c = getContract({ client, address: STAKING_CONTRACT });
      // TODO: call your contract write
      // await writeContract({ contract: c, method: "withdraw", params: [tokenId] })
      console.log("unstake =>", tokenId, "by", account.address);

      await logActivity("unstake", tokenId);
      alert(`Unstaked token #${tokenId}`);
      setTokenId("");
    } catch (e) {
      console.error(e);
      alert("Unstake failed — see console");
    }
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="font-semibold mb-3">Staking</div>
      <div className="flex gap-2">
        <Input
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="bg-gray-950 border-gray-800"
        />
        <Button onClick={onStake}>Stake</Button>
        <Button variant="outline" onClick={onUnstake}>Unstake</Button>
      </div>
      <div className="text-xs opacity-60 mt-2">
        This writes to your staking contract and mirrors an event in Firestore.
      </div>
    </div>
  );
}
