"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Plus, TrendingUp, X } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function PromoBanner() {
  const { user } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)
  const [showUrgency, setShowUrgency] = useState(false)

  useEffect(() => {
    // Show urgency message occasionally, not too frequently
    const urgencyTimer = setTimeout(() => {
      setShowUrgency(true)
    }, 15000) // Show after 15 seconds

    return () => clearTimeout(urgencyTimer)
  }, [])

  const handleShopNow = () => {
    // In real app, this would redirect to Shopify store
    window.open("https://shop.wheeldecides.com", "_blank")
  }

  if (isDismissed) {
    return null
  }

  const winChance = user ? ((user.slots / 24) * 100).toFixed(1) : "4.2"
  const potentialWinChance = user ? (((user.slots + 10) / 24) * 100).toFixed(1) : "45.8"

  return (
    <div className="space-y-3 mb-6">
      {/* Main Promo Banner */}
      <Card className="bg-gradient-to-r from-primary/15 to-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground text-sm">Boost Your Chances</span>
                {user && user.slots === 1 && (
                  <Badge variant="secondary" className="text-xs">
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {user ? (
                  <>
                    Current: {winChance}% → Potential: {potentialWinChance}% win chance
                  </>
                ) : (
                  "Get +10 slots with every T-shirt purchase"
                )}
              </p>
              <Button
                onClick={handleShopNow}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
              >
                <ShoppingBag className="h-3 w-3 mr-1" />
                Shop T-Shirts
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subtle Social Proof - only show occasionally */}
      {showUrgency && !isDismissed && (
        <Card className="bg-yellow-50/50 border-yellow-200/50 dark:bg-yellow-950/20 dark:border-yellow-800/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-yellow-600" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">2 players</span> just increased their slots in the last hour
              </p>
              <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
