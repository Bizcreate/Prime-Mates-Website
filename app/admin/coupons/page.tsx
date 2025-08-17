"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Copy } from "lucide-react"

export default function CouponsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const authCookie = document.cookie.includes("admin-auth=true")
    if (!authCookie) {
      window.location.href = "/admin/login"
    }
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  const coupons = [
    {
      id: 1,
      code: "SUMMER20",
      discount: "20%",
      type: "percentage",
      uses: 45,
      maxUses: 100,
      status: "active",
      expires: "2024-08-31",
    },
    {
      id: 2,
      code: "NEWBIE10",
      discount: "$10",
      type: "fixed",
      uses: 23,
      maxUses: 50,
      status: "active",
      expires: "2024-12-31",
    },
    {
      id: 3,
      code: "EXPIRED15",
      discount: "15%",
      type: "percentage",
      uses: 100,
      maxUses: 100,
      status: "expired",
      expires: "2024-01-31",
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Coupons</h2>
          <p className="text-gray-600 mt-1">Manage discount codes</p>
        </div>
        <Button className="bg-[#fdc730] hover:bg-yellow-400 text-black">
          <Plus className="mr-2 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search coupons..." className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Usage</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Expires</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-medium text-gray-900">{coupon.code}</span>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">{coupon.discount}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {coupon.uses}/{coupon.maxUses}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={coupon.status === "active" ? "default" : "secondary"}>{coupon.status}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{coupon.expires}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
