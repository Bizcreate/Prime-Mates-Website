"use client";
import { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { client } from "@/lib/thirdweb";
import { base, ethereum, polygon, arbitrum } from "thirdweb/chains";
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { getOwnedNFTs } from "thirdweb/extensions/erc721"; // v5 read

type NFT = { contract: string; tokenId: string; name?: string; image?: string };

// pick the right chain object for your contracts (adjust if they’re on another chain)
const CHAIN_BY_ADDRESS = (addr: string) => ethereum; // ← change if needed

function OwnedGrid({
  address,
  contractAddress,
  onStake,
}: {
  address: string;
  contractAddress: string;
  onStake: (n: NFT) => void;
}) {
  const chain = CHAIN_BY_ADDRESS(contractAddress);
  const contract = useMemo(
    () => getContract({ client, chain, address: contractAddress }),
    [contractAddress, chain]
  );

  const { data, isLoading, error } = useReadContract(getOwnedNFTs, {
    contract,
    owner: address,
  });

  const nfts: NFT[] =
    (data || []).map((it: any) => ({
      contract: contractAddress,
      tokenId: String(it.id ?? it.tokenId ?? it.token_id ?? ""),
      name: it.metadata?.name,
      image: it.metadata?.image,
    })) ?? [];

  return (
    <>
      {error && (
        <div className="col-span-full text-sm text-red-400">
          Failed to load {contractAddress.slice(0,6)}… NFTs: {String(error.message || error)}
        </div>
      )}
      {(isLoading ? Array.from({ length: 3 }) : nfts).map((n: any, i: number) => (
        <Card key={isLoading ? `${contractAddress}-${i}` : `${n.contract}:${n.tokenId}`} className="bg-gray-900 border-gray-800">
          <CardContent className="p-3">
            <div className="aspect-square rounded-lg bg-gray-800 overflow-hidden mb-2 flex items-center justify-center">
              {isLoading ? (
                <div className="w-10 h-10 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              ) : n.image ? (
                <img src={n.image} alt={n.name || n.tokenId} className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs opacity-60">No preview</div>
              )}
            </div>
            <div className="text-sm font-semibold">{isLoading ? "Loading…" : n.name || `#${n.tokenId}`}</div>
            <div className="text-xs opacity-70 break-all mt-1">{isLoading ? "" : contractAddress}</div>
            {!isLoading && (
              <div className="mt-3">
                <Button size="sm" onClick={() => onStake(n)}>Stake</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default function NFTGrid({
  address,
  contracts,
  onStake,
}: {
  address?: string;
  contracts: string[];
  onStake: (n: NFT) => void;
}) {
  if (!address) {
    return <div className="text-sm opacity-70">Connect a wallet to load your collection.</div>;
  }
  if (!contracts.length) {
    return <div className="text-sm opacity-70">Add your collection contract addresses to show NFTs.</div>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contracts.map((c) => (
        <OwnedGrid key={c} address={address} contractAddress={c} onStake={onStake} />
      ))}
    </div>
  );
}
