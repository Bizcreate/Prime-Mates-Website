import { TapstitchIntegration } from "@/components/tapstitch-integration"

export default function TapstitchAdminPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-yellow-400 mb-4">Tapstitch Integration</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your merch designs and sync products with Tapstitch
          </p>
        </div>

        <TapstitchIntegration />
      </div>
    </div>
  )
}
