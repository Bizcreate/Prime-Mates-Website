"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, UserPlus } from "lucide-react"

export default function StaffPage() {
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

  const staff = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@primemates.com",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-17",
    },
    {
      id: 2,
      name: "Store Manager",
      email: "manager@primemates.com",
      role: "manager",
      status: "active",
      lastLogin: "2024-01-16",
    },
    {
      id: 3,
      name: "Support Agent",
      email: "support@primemates.com",
      role: "support",
      status: "inactive",
      lastLogin: "2024-01-10",
    },
  ]

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "support":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Staff</h2>
          <p className="text-gray-600 mt-1">Manage team members</p>
        </div>
        <Button className="bg-[#fdc730] hover:bg-yellow-400 text-black">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input placeholder="Search staff..." className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>{member.status}</Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{member.lastLogin}</td>
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
