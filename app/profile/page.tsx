"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, MapPin, Instagram, Trophy, Ticket, ShoppingBag, LogOut, Edit3 } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default function Profile() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    instagramHandle: user?.instagramHandle || "",
    country: user?.country || "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!user) return

      try {
        setLoading(true)
        const history = await apiService.getPurchaseHistory(1, 10)
        setPurchaseHistory(history.purchases || [])
      } catch (error) {
        console.error('Error fetching purchase history:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPurchaseHistory()
    }
  }, [user])

  const handleSave = async () => {
    // In a real app, you would call an API to update the profile
    // For now, we'll just show a success message
    alert('Profile updated successfully!')
    setEditing(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Your account information</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(!editing)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">Full Name</Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              ) : (
                <p className="text-foreground">{user.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-card-foreground">Instagram Handle</Label>
              {editing ? (
                <Input
                  id="instagram"
                  value={formData.instagramHandle}
                  onChange={(e) => handleInputChange("instagramHandle", e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{user.instagramHandle}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-card-foreground">Country</Label>
              {editing ? (
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="bg-input border-border text-foreground"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-foreground">{user.country}</p>
                </div>
              )}
            </div>

            {editing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Statistics */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Ticket className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{user.totalEntries}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <ShoppingBag className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{user.totalShirtsPurchased}</p>
                <p className="text-sm text-muted-foreground">Shirts Bought</p>
              </div>
            </div>

            {user.isWinner && (
              <div className="mt-4 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-center">
                <Trophy className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-bold">🎉 You're a Winner! 🎉</p>
                <p className="text-white/90 text-sm">
                  Won on: {user.lastWinDate ? new Date(user.lastWinDate).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Recent Purchases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchaseHistory.length > 0 ? (
                purchaseHistory.map((purchase, index) => (
                  <div key={purchase._id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">
                        {purchase.items?.map((item: any) => item.itemName).join(', ')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">${purchase.totalAmount?.toFixed(2)}</p>
                      <Badge variant="secondary">
                        +{purchase.totalEntriesEarned} entries
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No purchases yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/store')}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Visit Store
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/game-status')}
            >
              <Trophy className="h-4 w-4 mr-2" />
              View Game Status
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push('/dashboard')}
            >
              <Ticket className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}