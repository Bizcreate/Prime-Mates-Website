"use client";

import { useEffect, useState } from "react";
import { addWeeks, isAfter, format } from "date-fns";
import { STAKING_REWARDS } from "@/constants/stakingConfig";
import { stakeNFT, unstakeNFT, getStakedNFTs } from "@/services/stakingService";
import { logActivity } from "@/lib/points";

type NFTStakeCardProps = {
  nft: any;
  ownerAddress: string;
  chainLabel: "ethereum" | "polygon";
  onUpdate?: () => void;
};

export function NFTStakeCard({ nft, ownerAddress, chainLabel, onUpdate }: NFTStakeCardProps) {
  const [stakePeriod, setStakePeriod] = useState(1);
  const [isStaked, setIsStaked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  function parseMetadata() {
    try {
      if (typeof nft.metadata === "string") return JSON.parse(nft.metadata);
      return nft.metadata;
    } catch {
      return nft.metadata ?? {};
    }
  }
  const metadata = parseMetadata();

  function ipfsToHttp(url?: string) {
    if (!url) return "";
    return url.startsWith("ipfs://") ? url.replace("ipfs://", "https://ipfs.io/ipfs/") : url;
  }
  const imageUrl = ipfsToHttp(metadata?.image);

  async function refreshStakeStatus() {
    if (!ownerAddress) return;
    const staked = await getStakedNFTs(ownerAddress);
    const id = nft.token_id ?? nft.id?.toString?.() ?? "";
    const found = staked.find((s) => s.nftId === id);
    setIsStaked(!!found);
    setStakeInfo(found || null);
  }

  useEffect(() => {
    refreshStakeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerAddress, nft?.token_id]);

  async function onStake() {
    if (!ownerAddress) return;
    setLoading(true);
    const startDate = new Date();
    const endDate = addWeeks(startDate, stakePeriod);
    const data = {
      nft,
      startDate,
      endDate,
      stakePeriod,
      rewardPercentage: STAKING_REWARDS[1][stakePeriod],
    };
    const ok = await stakeNFT(ownerAddress, data);
    if (ok) {
      await logActivity(ownerAddress, { type: "stake", tokenId: nft.token_id ?? nft.id });
      await refreshStakeStatus();
      onUpdate?.();
    }
    setLoading(false);
  }

  async function onUnstake() {
    if (!ownerAddress || !stakeInfo) return;
    const ends = new Date(stakeInfo.endDate?.toDate?.() ?? stakeInfo.endDate);
    if (isAfter(new Date(), ends) === false) {
      alert("Cannot unstake before lock period ends");
      return;
    }
    setLoading(true);
    const ok = await unstakeNFT(ownerAddress, nft.token_id ?? nft.id);
    if (ok) {
      await logActivity(ownerAddress, { type: "unstake", tokenId: nft.token_id ?? nft.id });
      await refreshStakeStatus();
      onUpdate?.();
    }
    setLoading(false);
  }

  return (
    <div
      className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-800"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {isStaked && stakeInfo && (
        <div className="absolute top-0 left-0 right-0 bg-green-500/90 text-white p-2 text-center z-10">
          <p className="text-sm">
            Staked until:{" "}
            {format(
              new Date(stakeInfo.endDate?.toDate?.() ?? stakeInfo.endDate),
              "PPP"
            )}
          </p>
          <button
            onClick={onUnstake}
            disabled={
              loading ||
              isAfter(
                new Date(),
                new Date(stakeInfo.endDate?.toDate?.() ?? stakeInfo.endDate)
              ) === false
            }
            className="mt-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm w-full"
          >
            {loading ? "Unstaking..." : "Unstake"}
          </button>
        </div>
      )}

      <div className="aspect-square relative">
        {imageUrl ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={metadata?.name || "NFT"}
              className={`w-full h-full object-cover ${imageLoading ? "opacity-0" : "opacity-100"}`}
              loading="lazy"
              onLoad={() => setImageLoading(false)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">No Image</div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
        <div className="space-y-1">
          <p className="text-white font-semibold text-sm truncate">
            {metadata?.name || `#${nft.token_id ?? nft.id}`}
          </p>
          <div className="flex items-center justify-between">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                chainLabel === "ethereum"
                  ? "bg-blue-500/20 text-blue-300"
                  : "bg-purple-500/20 text-purple-300"
              }`}
            >
              {chainLabel === "ethereum" ? "ETH" : "MATIC"}
            </span>
            {metadata?.attributes && showDetails && (
              <span className="text-xs text-gray-300">
                {metadata.attributes.length} traits
              </span>
            )}
          </div>
        </div>

        {!isStaked && showDetails && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-400">Lock</span>
              <select
                value={stakePeriod}
                onChange={(e) => setStakePeriod(Number(e.target.value))}
                className="w-full p-1.5 rounded-lg bg-gray-800 text-white text-sm"
                disabled={loading}
              >
                <option value={1}>1 Week</option>
                <option value={2}>2 Weeks</option>
                <option value={3}>3 Weeks</option>
                <option value={4}>4 Weeks</option>
              </select>
            </div>

            <div className="text-sm">
              Reward: <span className="text-yellow-300">{STAKING_REWARDS[1][stakePeriod]}%</span>
            </div>

            <button
              onClick={onStake}
              disabled={loading}
              className="w-full px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              {loading ? "Staking..." : "Stake NFT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
