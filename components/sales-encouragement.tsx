"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"
import { apiService } from "@/lib/api"

interface SalesEncouragementProps {
  userSlots: number
  totalParticipants: number
}

export function SalesEncouragement({ userSlots, totalParticipants }: SalesEncouragementProps) {
  const [showLiveActivity, setShowLiveActivity] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [totalEntries, setTotalEntries] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchTotalEntries = async () => {
      try {
        const stats = await apiService.getWheelStats()
        setTotalEntries(stats.totalEntries || 0)
      } catch (error) {
        console.error('Error fetching total entries:', error)
      }
    }

    fetchTotalEntries()
  }, [])

  const winChance = totalEntries > 0 ? ((userSlots / totalEntries) * 100).toFixed(1) : "0.0"
  const potentialWinChance = totalEntries > 0 ? (((userSlots + 10) / (totalEntries + 10)) * 100).toFixed(1) : "0.0"

  useEffect(() => {
    const activityInterval = setInterval(() => {
      setShowLiveActivity(true)
      setTimeout(() => setShowLiveActivity(false), 8000)
    }, 30000)

    return () => clearInterval(activityInterval)
  }, [])

  if (isDismissed) return null

  return (
    <div className="space-y-4">
      {showLiveActivity && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-muted-foreground">2 players just increased their entries in the last hour</span>
            <span className="text-red-500 font-medium">Live</span>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-yellow-500/20 border border-primary/30 rounded-lg p-4 text-center backdrop-blur-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Boost Your Chances</h3>
            <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Recommended</Badge>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-primary font-medium">Current:</span>
              <span>{winChance}%</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-green-500 font-medium">Potential:</span>
              <span>{potentialWinChance}%</span>
            </div>
            <div className="text-sm text-muted-foreground">Win Chance</div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium animate-pulse hover:animate-none transition-all duration-300 shadow-lg hover:shadow-primary/50"
              onClick={() => router.push("/store")}
            >
              Visit Store
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
