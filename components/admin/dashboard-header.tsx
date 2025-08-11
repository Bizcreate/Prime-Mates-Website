import { Button } from "@/components/ui/button"
import { Bell, Settings, UserCircle } from "lucide-react"

export function DashboardHeader() {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5 text-gray-600" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User Profile">
          <UserCircle className="h-7 w-7 text-gray-600" />
        </Button>
      </div>
    </header>
  )
}
