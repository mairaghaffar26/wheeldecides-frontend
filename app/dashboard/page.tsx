"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { SpinningWheel } from "@/components/spinning-wheel"
import { InfoCards } from "@/components/info-cards"
import { SalesEncouragement } from "@/components/sales-encouragement"
import { CountdownTimer } from "@/components/countdown-timer"
import { WinnerNotification } from "@/components/winner-notification"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { LogOut, Trophy, Users, Ticket } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [showWinnerNotification, setShowWinnerNotification] = useState(false)
  const [isWinner, setIsWinner] = useState(false)
  const [latestWinner, setLatestWinner] = useState<any>(null)
  const [winnersHistory, setWinnersHistory] = useState<any[]>([])
  const [gameSettings, setGameSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const [dashboard, winnerCheck, latestWinnerData, winnersData, settings] = await Promise.all([
          apiService.getDashboardData(),
          apiService.checkWinner(),
          apiService.getLatestWinner().catch(() => null),
          apiService.getRecentWinners(10).catch(() => ({ winners: [] })),
          apiService.getGameSettings().catch(() => null)
        ])
        
        setDashboardData(dashboard)
        setIsWinner(winnerCheck.isWinner)
        setShowWinnerNotification(winnerCheck.showWinnerNotification)
        // Extract winner data from the nested response, fallback to dashboard data
        setLatestWinner(latestWinnerData?.winner || latestWinnerData || dashboard.latestWinner)
        setWinnersHistory(winnersData.winners || [])
        setGameSettings(settings)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // Polling for live updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user || loading) return
      
      try {
        const [dashboard, winnerCheck, latestWinnerData, winnersData, settings] = await Promise.all([
          apiService.getDashboardData(),
          apiService.checkWinner(),
          apiService.getLatestWinner().catch(() => null),
          apiService.getRecentWinners(10).catch(() => ({ winners: [] })),
          apiService.getGameSettings().catch(() => null)
        ])
        
        setDashboardData(dashboard)
        setIsWinner(winnerCheck.isWinner)
        // Only show winner notification if not already shown
        if (winnerCheck.showWinnerNotification && !showWinnerNotification) {
          setShowWinnerNotification(true)
        }
        // Extract winner data from the nested response, fallback to dashboard data
        setLatestWinner(latestWinnerData?.winner || latestWinnerData || dashboard.latestWinner)
        setWinnersHistory(winnersData.winners || [])
        setGameSettings(settings)
      } catch (error) {
        console.error('Error refreshing dashboard data:', error)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, loading, showWinnerNotification])

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
            <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name}!</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Winner Notification Modal */}
        {showWinnerNotification && latestWinner && (
          <WinnerNotification 
            winner={latestWinner}
            onClose={async () => {
              try {
                await apiService.markCongratsShown()
                setShowWinnerNotification(false)
              } catch (error) {
                console.error('Error marking congrats as shown:', error)
                setShowWinnerNotification(false)
              }
            }}
          />
        )}

        {/* Welcome Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Welcome, {user.name.split(" ")[0]}!</h2>
          <p className="text-primary font-medium">You're in the game! Good luck!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold text-foreground">{dashboardData?.statistics?.totalEntries || 0}</p>
                </div>
                <Ticket className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shirts Bought</p>
                  <p className="text-2xl font-bold text-foreground">{user.totalShirtsPurchased}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <CountdownTimer 
          gameSettings={gameSettings}
          loading={loading}
        />

        {/* Info Cards */}
        <InfoCards 
          gameStats={dashboardData?.statistics}
          gameSettings={gameSettings}
          loading={loading}
        />

        {user.totalEntries < 5 && <SalesEncouragement userSlots={user.totalEntries} totalParticipants={dashboardData?.statistics?.totalUsers || 0} />}

        {/* Spinning Wheel */}
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Live Wheel</h3>
          <SpinningWheel />
        </div>

        {/* Latest Winner */}
        {latestWinner && !isWinner && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Latest Winner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-foreground">{latestWinner.userName}</p>
                <p className="text-sm text-muted-foreground">@{latestWinner.instagramHandle}</p>
                <p className="text-sm text-muted-foreground">Prize: {latestWinner.prize}</p>
                <p className="text-xs text-muted-foreground">
                  Won on: {new Date(latestWinner.winDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Winner - Show when no winner exists */}
        {!latestWinner && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Latest Winner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-muted-foreground">No winners yet</p>
                <p className="text-sm text-muted-foreground">Be the first to win!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Winners History */}
        {winnersHistory.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {winnersHistory.map((winner, index) => (
                  <div key={winner.userId || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{winner.userName}</p>
                        <p className="text-xs text-muted-foreground">@{winner.instagramHandle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{winner.prize}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(winner.winDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
