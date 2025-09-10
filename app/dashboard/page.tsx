import type { Metadata } from "next"
import DashboardClient from "./DashboardClient"

export const metadata: Metadata = {
  title: "Member Dashboard - Prime Mates Board Club",
  description: "Access your PMBC NFT holdings, tier status, and exclusive member benefits",
}

export default function DashboardPage() {
  return <DashboardClient />
}
