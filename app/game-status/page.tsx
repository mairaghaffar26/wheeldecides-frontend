"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdBanner } from "@/components/ad-banner"
import { Trophy, Users, Ticket, TrendingUp, Clock, LogOut } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default function GameStatus() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [gameData, setGameData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const isGuest = user?.isGuest || false

  useEffect(() => {
    // Guest users are allowed to view game status
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchGameData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        if (isGuest) {
          // Fetch public data for guests
          const [publicStats, wheelStats] = await Promise.all([
            apiService.getPublicStats(),
            apiService.getWheelStats().catch(() => ({ totalUsers: 0, totalSpins: 0, totalWinners: 0, entries: [] }))
          ])
          
          setGameData({
            stats: {
              totalUsers: publicStats.statistics.totalUsers,
              totalSpins: publicStats.statistics.totalSpins,
              totalWinners: publicStats.statistics.totalWinners,
              totalEntries: publicStats.statistics.totalEntries
            },
            leaderboard: publicStats.leaderboard || [],
            recentWinners: publicStats.recentWinners || []
          })
        } else {
          // Fetch authenticated data for registered users
          const [stats, leaderboard, recentWinners] = await Promise.all([
            apiService.getWheelStats(),
            apiService.getLeaderboard(10),
            apiService.getRecentWinners(5)
          ])
          
          setGameData({
            stats,
            leaderboard: leaderboard.leaderboard || [],
            recentWinners: recentWinners.winners || []
          })
        }
      } catch (error) {
        console.error('Error fetching game data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchGameData()
    }
  }, [user, isGuest])

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
          <div className="flex items-center gap-2">
            {isGuest && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/unified-login")} 
                className="text-foreground border-primary hover:bg-primary/10"
              >
                Login
              </Button>
            )}
            {!isGuest && (
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Guest Registration CTA */}
        {isGuest && (
          <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border-primary/50 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Join the Competition!</h3>
                  <p className="text-muted-foreground">
                    Register now to join the leaderboard and compete for amazing prizes!
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/register")}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow font-bold"
                  size="lg"
                >
                  Register & Get FREE Entry! 🎁
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Statistics - Show to all users */}
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
                  <p className="text-2xl font-bold text-foreground">{isGuest ? 0 : user.totalEntries}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ad Banner 1 - After Stats */}
        <AdBanner />

        {/* Additional encouragement for guests after seeing stats */}
        {isGuest && gameData?.stats && (
          <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <p className="text-foreground font-semibold">
                  🎯 {gameData.stats.totalUsers} players competing · {gameData.stats.totalSpins} spins completed!
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't miss out! Register to get your chance to win.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard - Show to all users */}
        {gameData?.leaderboard && gameData.leaderboard.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gameData.leaderboard.map((player: any, index: number) => (
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
        )}

        {/* Ad Banner 2 - After Leaderboard */}
        <AdBanner />

        {/* Recent Winners - Show to all users */}
        {gameData?.recentWinners && gameData.recentWinners.length > 0 && (
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
        )}

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