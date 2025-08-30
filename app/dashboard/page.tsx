import type { Metadata } from "next"
import { MemberDashboard } from "@/components/member-dashboard"
import { MultiWalletProvider } from "@/contexts/multi-wallet-context"
import { TokenProvider } from "@/contexts/token-context"

export const metadata: Metadata = {
  title: "Member Dashboard - Prime Mates Board Club",
  description: "Access your PMBC NFT holdings, tier status, and exclusive member benefits",
}

export default function DashboardPage() {
  return (
    <MultiWalletProvider>
      <TokenProvider>
        <MemberDashboard />
      </TokenProvider>
    </MultiWalletProvider>
  )
}
