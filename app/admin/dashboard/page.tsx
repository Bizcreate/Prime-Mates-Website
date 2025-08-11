import { DashboardHeader } from "@/components/admin/dashboard-header"
import { DashboardOverviewCards } from "@/components/admin/dashboard-overview-cards"
import { ProductOrderManagementPlaceholder } from "@/components/admin/product-order-management-placeholder"
import { Footer } from "@/components/footer" // Assuming you want the footer on admin pages too

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <DashboardOverviewCards />
        <ProductOrderManagementPlaceholder />
      </main>
      <Footer />
    </div>
  )
}
