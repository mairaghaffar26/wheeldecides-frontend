"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Ticket, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth"

interface InfoCardsProps {
  gameStats?: {
    totalUsers: number
    totalEntries: number
    totalSpins: number
    totalWinners: number
  }
  gameSettings?: {
    currentPrize: string
    prizeDescription: string
  }
  loading?: boolean
}

export function InfoCards({ gameStats, gameSettings, loading = false }: InfoCardsProps) {
  const { user } = useAuth()

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalEntries = gameStats?.totalEntries || 0
  const userEntries = user?.totalEntries || 0
  const totalUsers = gameStats?.totalUsers || 0
  const winChance = totalEntries > 0 ? ((userEntries / totalEntries) * 100).toFixed(1) : "0.0"
  
  // Show loading state or no data state
  const hasData = gameStats && !loading

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Your Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-primary">{userEntries}</div>
          {userEntries > 1 && (
            <Badge variant="secondary" className="mt-1 text-xs">
              Boosted!
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
          <div className="text-xs text-muted-foreground">Total players</div>
          {!hasData && <div className="text-xs text-red-400">Loading...</div>}
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Prize
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-sm font-medium text-foreground">
            {gameSettings?.currentPrize || "iPhone 15 Pro Max"}
          </div>
          <div className="text-xs text-muted-foreground">Current prize</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Win Chance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-lg font-bold text-primary">{winChance}%</div>
          {userEntries === 1 && <div className="text-xs text-muted-foreground">Can be boosted!</div>}
          {!hasData && <div className="text-xs text-red-400">Loading...</div>}
          <div className="text-xs text-muted-foreground">({userEntries}/{totalEntries})</div>
        </CardContent>
      </Card>
    </div>
  )
}
