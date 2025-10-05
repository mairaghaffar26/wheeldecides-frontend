"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LogOut, Timer, Trophy, Play, Pause, RotateCcw, Loader2, Save } from "lucide-react"

export default function AdminGameControl() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [gameSettings, setGameSettings] = useState({
    currentPrize: "",
    prizeDescription: "",
    spinCountdownDays: 0,
    spinCountdownHours: 0,
    spinCountdownMinutes: 0,
    isGameActive: true,
    autoSpinEnabled: true,
    shopifyStoreUrl: "",
    shopifyEnabled: false,
    gameStartTime: null,
    gameEndTime: null,
    countdownActive: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchGameSettings = async () => {
      if (!user) return

      try {
        setLoading(true)
        const settings = await apiService.getAdminGameSettings()
        setGameSettings(settings)
      } catch (error) {
        console.error('Error fetching game settings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "super_admin") {
      fetchGameSettings()
    }
  }, [user])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      await apiService.updateGameSettings(gameSettings)
      alert("Game settings saved successfully!")
      
      // Refresh settings after save
      const updatedSettings = await apiService.getAdminGameSettings()
      setGameSettings(updatedSettings)
    } catch (error) {
      console.error('Error saving game settings:', error)
      alert(`Failed to save game settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleStartCountdown = async () => {
    if (gameSettings.spinCountdownDays === 0 && gameSettings.spinCountdownHours === 0 && gameSettings.spinCountdownMinutes === 0) {
      alert("Please set a countdown time before starting!")
      return
    }

    try {
      setSaving(true)
      await apiService.updateGameSettings({ ...gameSettings, startCountdown: true })
      alert("Countdown started successfully!")
      
      // Refresh settings after save
      const updatedSettings = await apiService.getAdminGameSettings()
      setGameSettings(updatedSettings)
    } catch (error) {
      console.error('Error starting countdown:', error)
      alert(`Failed to start countdown: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleSpinNow = async () => {
    try {
      setSpinning(true)
      await apiService.triggerSpin()
      alert("Wheel is spinning! Winner will be announced shortly.")
    } catch (error) {
      console.error('Error triggering spin:', error)
      alert("Failed to trigger spin")
    } finally {
      setSpinning(false)
    }
  }

  const handleResetGame = async () => {
    if (confirm("Are you sure you want to reset the game? This will clear all current progress.")) {
      try {
        await apiService.resetGame()
        alert("Game has been reset successfully!")
        // Refresh settings
        const settings = await apiService.getGameSettings()
        setGameSettings(settings)
      } catch (error) {
        console.error('Error resetting game:', error)
        alert("Failed to reset game")
      }
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
            <h1 className="text-xl font-bold text-foreground">Game Control</h1>
            <p className="text-sm text-muted-foreground">Manage game settings and controls</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Game Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Play className="h-5 w-5" />
              Game Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div>
                <p className="font-medium text-foreground">Current Status</p>
                <p className="text-sm text-muted-foreground">
                  Game is {gameSettings.isGameActive ? "Active" : "Paused"}
                </p>
              </div>
              <Button
                onClick={() => setGameSettings({ ...gameSettings, isGameActive: !gameSettings.isGameActive })}
                variant={gameSettings.isGameActive ? "destructive" : "default"}
                className={gameSettings.isGameActive ? "" : "bg-primary text-primary-foreground hover:bg-primary/90"}
              >
                {gameSettings.isGameActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Game
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Game
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleSpinNow}
                className="h-16 bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
                disabled={!gameSettings.isGameActive || spinning}
              >
                {spinning ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                <RotateCcw className="h-5 w-5 mr-2" />
                )}
                {spinning ? "Spinning..." : "Spin Wheel Now"}
              </Button>
              <Button
                onClick={handleResetGame}
                variant="destructive"
                className="h-16"
                disabled={!gameSettings.isGameActive || spinning}
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Reset Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prize Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Prize Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prize" className="text-card-foreground">
                Current Prize
              </Label>
              <Input
                id="prize"
                value={gameSettings.currentPrize}
                onChange={(e) => setGameSettings({ ...gameSettings, currentPrize: e.target.value })}
                className="bg-input border-border text-foreground"
                placeholder="Enter prize name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeDescription" className="text-card-foreground">
                Prize Description
              </Label>
              <Textarea
                id="prizeDescription"
                value={gameSettings.prizeDescription}
                onChange={(e) => setGameSettings({ ...gameSettings, prizeDescription: e.target.value })}
                className="bg-input border-border text-foreground"
                placeholder="Enter detailed prize description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Countdown Timer Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Game Session Countdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Countdown Status */}
            {gameSettings.countdownActive && gameSettings.gameEndTime && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Countdown Active</p>
                    <p className="text-sm text-muted-foreground">
                      Game ends: {new Date(gameSettings.gameEndTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">
                      {Math.max(0, Math.floor((new Date(gameSettings.gameEndTime).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}d{" "}
                      {Math.max(0, Math.floor(((new Date(gameSettings.gameEndTime).getTime() - new Date().getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))}h{" "}
                      {Math.max(0, Math.floor(((new Date(gameSettings.gameEndTime).getTime() - new Date().getTime()) % (1000 * 60 * 60)) / (1000 * 60)))}
                    </p>
                    <p className="text-xs text-muted-foreground">remaining</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days" className="text-card-foreground">
                  Days
                </Label>
                <Input
                  id="days"
                  type="number"
                  min="0"
                  max="30"
                  value={gameSettings.spinCountdownDays}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, spinCountdownDays: Number.parseInt(e.target.value) || 0 })
                  }
                  className="bg-input border-border text-foreground"
                  disabled={gameSettings.countdownActive}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours" className="text-card-foreground">
                  Hours
                </Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={gameSettings.spinCountdownHours}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, spinCountdownHours: Number.parseInt(e.target.value) || 0 })
                  }
                  className="bg-input border-border text-foreground"
                  disabled={gameSettings.countdownActive}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minutes" className="text-card-foreground">
                  Minutes
                </Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={gameSettings.spinCountdownMinutes}
                  onChange={(e) =>
                    setGameSettings({ ...gameSettings, spinCountdownMinutes: Number.parseInt(e.target.value) || 0 })
                  }
                  className="bg-input border-border text-foreground"
                  disabled={gameSettings.countdownActive}
                />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Set countdown duration:{" "}
                <span className="font-medium text-foreground">
                  {gameSettings.spinCountdownDays}d {gameSettings.spinCountdownHours}h{" "}
                  {gameSettings.spinCountdownMinutes}m
                </span>
              </p>
            </div>

            <Button
              onClick={handleStartCountdown}
              disabled={gameSettings.countdownActive || saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Timer className="h-4 w-4 mr-2" />
              )}
              {gameSettings.countdownActive ? "Countdown Active" : "Start Countdown"}
            </Button>
          </CardContent>
        </Card>

        {/* Shopify Integration Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Shopify Store Settings</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure your Shopify store for shirt purchases
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopifyUrl" className="text-card-foreground">
                Shopify Store URL
              </Label>
              <Input
                id="shopifyUrl"
                value={gameSettings.shopifyStoreUrl}
                onChange={(e) => setGameSettings({ ...gameSettings, shopifyStoreUrl: e.target.value })}
                className="bg-input border-border text-foreground"
                placeholder="https://your-store.myshopify.com"
              />
              <p className="text-xs text-muted-foreground">
                Users will be redirected to this URL to purchase shirts
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium text-foreground">Enable Shopify Integration</p>
                <p className="text-sm text-muted-foreground">
                  Users will use purchase codes to verify shirt purchases
                </p>
              </div>
              <Button
                onClick={() => setGameSettings({ ...gameSettings, shopifyEnabled: !gameSettings.shopifyEnabled })}
                variant={gameSettings.shopifyEnabled ? "default" : "outline"}
                className={gameSettings.shopifyEnabled ? "bg-primary text-primary-foreground" : ""}
              >
                {gameSettings.shopifyEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {gameSettings.shopifyStoreUrl && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-foreground font-medium mb-1">Preview:</p>
                <p className="text-sm text-muted-foreground break-all">
                  {gameSettings.shopifyStoreUrl}
                </p>
              </div>
            )}

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>How it works:</strong> Users click "Buy Shirts" → Redirected to Shopify → Complete purchase → 
                Receive email with verification code → Enter code in app to claim 10 entries per shirt
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Settings */}
        <Button
          onClick={handleSaveSettings}
          className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Admin Navigation */}
      <AdminNav />
    </div>
  )
}
