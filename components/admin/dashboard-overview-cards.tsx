import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, GitPullRequest, Star } from "lucide-react"

export function DashboardOverviewCards() {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <Card className="bg-white shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Live Merch Activity</CardTitle>
          <Package className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">150 Orders</div>
          <p className="text-xs text-gray-500">+20% from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Community Engagement</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">862,351 Interactions</div>
          <p className="text-xs text-gray-500">24h peak: 896,190</p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Latest Updates</CardTitle>
          <GitPullRequest className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">2,489 Merged PRs</div>
          <p className="text-xs text-gray-500">2024 total</p>
          <div className="mt-2 text-sm text-gray-700">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>v3.21.10</span> <span className="text-gray-500 text-xs">19 days ago</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span>v3.20.97</span> <span className="text-gray-500 text-xs">2 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
