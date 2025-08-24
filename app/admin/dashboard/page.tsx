"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Package,
  RefreshCw,
  Calendar,
  CalendarDays,
  Clock,
  Truck,
  CheckCircle,
  ImageIcon,
  Settings,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check auth
    const authCookie = document.cookie.includes("admin-auth=true")
    if (!authCookie) {
      window.location.href = "/admin/login"
    }
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-purple-100">Gesture Overlays</CardTitle>
              <div className="text-2xl font-bold mt-2">Manage NFT Gestures</div>
            </div>
            <ImageIcon className="h-8 w-8 text-purple-200" />
          </CardHeader>
          <CardContent>
            <Link href="/admin/gestures">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Manage Overlays
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-indigo-100">WooCommerce Integration</CardTitle>
              <div className="text-2xl font-bold mt-2">Merch Products</div>
            </div>
            <Settings className="h-8 w-8 text-indigo-200" />
          </CardHeader>
          <CardContent>
            <Link href="/admin/woocommerce">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Manage Products
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-pink-100">WooCommerce Sync</CardTitle>
              <div className="text-2xl font-bold mt-2">Product Sync</div>
            </div>
            <RefreshCw className="h-8 w-8 text-pink-200" />
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-0">
              Sync Products
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-teal-100">Today Orders</CardTitle>
              <div className="text-3xl font-bold mt-2">$897.40</div>
            </div>
            <Package className="h-8 w-8 text-teal-200" />
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-orange-100">Yesterday Orders</CardTitle>
              <div className="text-3xl font-bold mt-2">$679.93</div>
            </div>
            <Package className="h-8 w-8 text-orange-200" />
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-blue-100">This Month</CardTitle>
              <div className="text-3xl font-bold mt-2">$13146.96</div>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-200" />
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-cyan-100">Last Month</CardTitle>
              <div className="text-3xl font-bold mt-2">$31964.92</div>
            </div>
            <Calendar className="h-8 w-8 text-cyan-200" />
          </CardHeader>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-green-100">All-Time Sales</CardTitle>
              <div className="text-3xl font-bold mt-2">$626513.05</div>
            </div>
            <CalendarDays className="h-8 w-8 text-green-200" />
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mt-2">815</div>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">Orders Pending</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mt-2">263</div>
            </div>
            <div className="p-2 bg-teal-100 rounded-lg">
              <Clock className="h-6 w-6 text-teal-600" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">Orders Processing</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mt-2">97</div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">Orders Delivered</CardTitle>
              <div className="text-3xl font-bold text-gray-900 mt-2">418</div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Weekly Sales</CardTitle>
            <div className="flex space-x-4 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Sales</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Orders</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {/* Simple chart representation */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-32 bg-green-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500">Mon</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-24 bg-green-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500">Tue</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-16 bg-green-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500">Wed</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-20 bg-green-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500">Thu</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-18 bg-green-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500">Fri</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-28 bg-green-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500">Sat</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-48 bg-green-500 rounded-t mb-2"></div>
                <span className="text-xs text-gray-500">Sun</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Best Selling Products</CardTitle>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Green Leaf Lettuce</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Rainbow Chard</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Clementine</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Mint</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {/* Simple pie chart representation */}
              <div className="relative w-48 h-48">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(
                    #10b981 0deg 120deg,
                    #3b82f6 120deg 200deg,
                    #f97316 200deg 280deg,
                    #8b5cf6 280deg 360deg
                  )`,
                  }}
                ></div>
                <div className="absolute inset-8 bg-white rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
