"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useMultiWallet } from "@/contexts/multi-wallet-context"
import { Wallet, Plus, Trash2, Star, RefreshCw, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MultiWalletManager() {
  const {
    wallets,
    primaryWallet,
    activeWallet,
    isLoading,
    addWallet,
    removeWallet,
    setPrimaryWallet,
    refreshWallet,
    refreshAllWallets,
    getTotalBalance,
  } = useMultiWallet()

  const [newWalletAddress, setNewWalletAddress] = useState("")
  const [newWalletLabel, setNewWalletLabel] = useState("")
  const [isAddingWallet, setIsAddingWallet] = useState(false)
  const { toast } = useToast()

  const handleAddWallet = async () => {
    if (!newWalletAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      })
      return
    }

    // Basic validation for Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(newWalletAddress.trim())) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid Ethereum address (0x...)",
        variant: "destructive",
      })
      return
    }

    setIsAddingWallet(true)
    try {
      await addWallet(newWalletAddress.trim(), newWalletLabel.trim() || undefined)
      setNewWalletAddress("")
      setNewWalletLabel("")
      toast({
        title: "Wallet Added",
        description: "Successfully added wallet to your profile",
      })
    } catch (error) {
      toast({
        title: "Failed to Add Wallet",
        description: "Could not add wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingWallet(false)
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <Card className="bg-gray-900 border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center justify-between">
            <span className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" />
              Wallet Portfolio ({wallets.length})
            </span>
            <Button
              onClick={refreshAllWallets}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-yellow-400/50 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">{wallets.length}</div>
              <p className="text-sm text-gray-400">Connected Wallets</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{getTotalBalance()} ETH</div>
              <p className="text-sm text-gray-400">Total Balance</p>
            </div>
            <div className="text-center p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {wallets.reduce((sum, w) => sum + w.nfts.length, 0)}
              </div>
              <p className="text-sm text-gray-400">Total NFTs</p>
            </div>
          </div>

          {/* Add Wallet Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Additional Wallet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-yellow-400/20">
              <DialogHeader>
                <DialogTitle className="text-yellow-400">Add New Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-gray-300">
                    Wallet Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    value={newWalletAddress}
                    onChange={(e) => setNewWalletAddress(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="label" className="text-gray-300">
                    Label (Optional)
                  </Label>
                  <Input
                    id="label"
                    placeholder="e.g., Trading Wallet, Cold Storage"
                    value={newWalletLabel}
                    onChange={(e) => setNewWalletLabel(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={handleAddWallet}
                  disabled={isAddingWallet}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  {isAddingWallet ? "Adding..." : "Add Wallet"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Wallet List */}
      <div className="space-y-4">
        {wallets.map((wallet) => (
          <Card
            key={wallet.id}
            className={`bg-gray-900 border-2 ${
              wallet.isPrimary
                ? "border-yellow-400/60"
                : activeWallet?.id === wallet.id
                  ? "border-blue-400/60"
                  : "border-gray-700"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{wallet.label}</h3>
                      {wallet.isPrimary && (
                        <Badge className="bg-yellow-400 text-black">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      {activeWallet?.id === wallet.id && !wallet.isPrimary && (
                        <Badge className="bg-blue-500">Active</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-sm text-gray-400">{formatAddress(wallet.address)}</span>
                      <Button
                        onClick={() => copyAddress(wallet.address)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, "_blank")}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-400">{wallet.balance} ETH</div>
                    <div className="text-xs text-gray-400">{wallet.nfts.length} NFTs</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => refreshWallet(wallet.id)}
                      disabled={isLoading}
                      variant="outline"
                      size="sm"
                      className="border-gray-600"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>

                    {!wallet.isPrimary && (
                      <>
                        <Button
                          onClick={() => setPrimaryWallet(wallet.id)}
                          variant="outline"
                          size="sm"
                          className="border-yellow-400/50 text-yellow-400"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => removeWallet(wallet.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-400/50 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">Last updated: {wallet.lastUpdated.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {wallets.length === 0 && (
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Wallets Connected</h3>
            <p className="text-gray-400 mb-4">Connect your first wallet to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
