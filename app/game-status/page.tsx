"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Ticket, TrendingUp, Clock, LogOut } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default function GameStatus() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [gameData, setGameData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchGameData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const [stats, leaderboard, recentWinners] = await Promise.all([
          apiService.getWheelStats(),
          apiService.getLeaderboard(10),
          apiService.getRecentWinners(5)
        ])
        
        setGameData({
          stats,
          leaderboard: leaderboard.leaderboard,
          recentWinners: recentWinners.winners
        })
      } catch (error) {
        console.error('Error fetching game data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchGameData()
    }
  }, [user])

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
            <h1 className="text-xl font-bold text-foreground">Game Status</h1>
            <p className="text-sm text-muted-foreground">Live game statistics and leaderboard</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Game Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{gameData?.stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spins</p>
                  <p className="text-2xl font-bold text-foreground">{gameData?.stats?.totalSpins || 0}</p>
                </div>
                <Ticket className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Winners</p>
                  <p className="text-2xl font-bold text-foreground">{gameData?.stats?.totalWinners || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Entries</p>
                  <p className="text-2xl font-bold text-foreground">{user.totalEntries}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gameData?.leaderboard?.map((player: any, index: number) => (
                <div key={player.userId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                                ? "bg-gray-400 text-black"
                                : index === 2
                                  ? "bg-amber-600 text-white"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                      <p className="font-medium text-foreground">{player.name}</p>
                      <p className="text-sm text-muted-foreground">@{player.instagramHandle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={player.totalEntries > 1 ? "default" : "secondary"}>
                      {player.totalEntries} entries
                    </Badge>
                    {player.isWinner && (
                      <Badge className="ml-2 bg-yellow-500 text-black">
                        Winner
                              </Badge>
                            )}
                          </div>
                        </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  No players yet
                      </div>
              )}
                        </div>
          </CardContent>
        </Card>

        {/* Recent Winners */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Winners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gameData?.recentWinners?.map((winner: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-black" />
                      </div>
                    <div>
                      <p className="font-medium text-foreground">{winner.userName}</p>
                      <p className="text-sm text-muted-foreground">@{winner.instagramHandle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{winner.prize}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(winner.winDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  No winners yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Rules */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Clock className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• You get 1 entry just for registering</p>
              <p>• Buy items from the store to get more entries</p>
              <p>• Each shirt gives you 10 wheel entries</p>
              <p>• The wheel spins automatically or manually by admin</p>
              <p>• Winners are announced in real-time</p>
              <p>• More entries = higher chance of winning!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}