"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, Users, Ticket, Trophy, Clock, TrendingUp, AlertCircle, Settings, Play, Lock, Gift } from "lucide-react"
import { socketService } from "@/lib/socket"
import { globalLogoutService } from "@/lib/global-logout"

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [adminData, setAdminData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [countdownNotification, setCountdownNotification] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const data = await apiService.getAdminDashboard()
        setAdminData(data)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "super_admin") {
      fetchAdminData()
    }
  }, [user])

  // Monitor countdown status
  useEffect(() => {
    // Connect to socket and join admin room
    socketService.connect()
    socketService.joinAdminRoom()

    // Listen for countdown expired notifications
    const handleCountdownExpired = (data: any) => {
      setCountdownNotification(data.message || 'Game countdown has expired! Time to spin the wheel.')
    }

    socketService.onCountdownExpired(handleCountdownExpired)

    // Register for global logout events
    const unsubscribeLogout = globalLogoutService.registerLogoutCallback(() => {
      // Clear any local state
      setAdminData(null)
      setCountdownNotification(null)
    })

    // Fallback polling for countdown status
    const checkCountdown = async () => {
      if (!user || user.role !== "super_admin") return
      
      try {
        const response = await fetch('/api/admin/check-countdown', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        })
        const data = await response.json()
        
        if (data.success && data.data.countdownExpired) {
          setCountdownNotification('Game countdown has expired! Time to spin the wheel.')
        }
      } catch (error) {
        console.error('Error checking countdown:', error)
      }
    }

    // Check every 30 seconds
    const interval = setInterval(checkCountdown, 30000)
    checkCountdown() // Initial check

    return () => {
      clearInterval(interval)
      socketService.removeListener('countdown-expired', handleCountdownExpired)
      unsubscribeLogout()
    }
  }, [user])

  const handleSpin = async () => {
    try {
      setSpinning(true)
      await apiService.triggerSpin()
      // Refresh data after spin
      const data = await apiService.getAdminDashboard()
      setAdminData(data)
      
      // Show success message
      alert('Wheel spun successfully! All entries have been reset.')
    } catch (error) {
      console.error('Error triggering spin:', error)
      alert('Error spinning wheel: ' + (error as Error).message)
    } finally {
      setSpinning(false)
    }
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

  if (!user || user.role !== "super_admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Countdown Notification */}
        {countdownNotification && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700 font-medium">{countdownNotification}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCountdownNotification(null)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold text-foreground">{adminData?.statistics?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold text-foreground">{adminData?.statistics?.totalEntries || 0}</p>
                </div>
                <Ticket className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div>
                <p className="font-medium text-foreground">Game Status</p>
                <p className="text-sm text-muted-foreground">
                  {adminData?.gameSettings?.gameActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <Badge className={adminData?.gameSettings?.gameActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                {adminData?.gameSettings?.gameActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Manual Spin</p>
                  <p className="text-sm text-muted-foreground">Trigger wheel spin manually</p>
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-primary text-primary-foreground"
                onClick={handleSpin}
                disabled={spinning}
              >
                {spinning ? 'Spinning...' : 'Spin Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminData?.recentActivity?.recentSpins?.slice(0, 5).map((spin: any, index: number) => (
                <div key={spin._id || index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Spin completed - Winner: {spin.winner?.userName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {spin.triggeredBy?.name} • {new Date(spin.completedAt || spin.spinTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => router.push("/admin/participants")}
            className="h-16 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Users className="h-5 w-5 mr-2" />
            Manage Participants
          </Button>
          <Button
            onClick={() => router.push("/admin/superadmin")}
            className="h-16 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Users className="h-5 w-5 mr-2" />
            Manage Superadmin
          </Button>
          <Button
            onClick={() => router.push("/admin/purchase-codes")}
            className="h-16 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Gift className="h-5 w-5 mr-2" />
            Purchase Codes
          </Button>
          <Button
            onClick={() => router.push("/admin/change-password")}
            className="h-16 bg-red-600 text-white hover:bg-red-700"
          >
            <Lock className="h-5 w-5 mr-2" />
            Change Password
          </Button>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNav />
    </div>
  )
}
