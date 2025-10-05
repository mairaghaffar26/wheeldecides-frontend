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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  LogOut, 
  Save, 
  Settings, 
  Bell, 
  Gamepad2, 
  Palette, 
  Loader2, 
  Shield, 
  Users, 
  Clock, 
  Mail,
  Smartphone,
  Globe,
  DollarSign,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Info,
  RotateCcw
} from "lucide-react"

export default function AdminSettings() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: "The Wheel Decides",
    platformDescription: "Spin to win amazing prizes!",
    contactEmail: "",
    supportEmail: "",
    
    // Game Settings
    defaultEntriesPerUser: 1,
    maxEntriesPerUser: 1000,
    entriesPerShirt: 10,
    entriesPerHoodie: 20,
    entriesPerCap: 5,
    minPurchaseAmount: 0,
    maxPurchaseAmount: 1000,
    
    // Wheel Settings
    wheelSpinDuration: 5,
    autoSpinEnabled: false,
    autoSpinInterval: 60,
    maintenanceMode: false,
    
    // Prize Settings
    defaultPrize: "Mystery Prize",
    prizeDescription: "Amazing prizes await!",
    maxPrizeValue: 1000,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    winnerNotifications: true,
    purchaseNotifications: true,
    newUserNotifications: true,
    
    // Security Settings
    requireEmailVerification: false,
    allowMultipleAccounts: true,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    
    // Integration Settings
    shopifyEnabled: false,
    shopifyStoreUrl: "",
    shopifyApiKey: "",
    shopifyWebhookSecret: "",
    
    // Social Media
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    
    // Legal
    termsOfService: "",
    privacyPolicy: "",
    refundPolicy: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return

      try {
        setLoading(true)
        const data = await apiService.getPlatformSettings()
        setSettings(data)
      } catch (error) {
        console.error('Error fetching platform settings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role === "super_admin") {
      fetchSettings()
    }
  }, [user])

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveStatus('idle')
      
      // Update platform settings
      await apiService.updatePlatformSettings(settings)
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving platform settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      setSaveStatus('idle')
      
      const defaultSettings = await apiService.resetPlatformSettings()
      setSettings(defaultSettings)
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error resetting platform settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
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
            <h1 className="text-xl font-bold text-foreground">Platform Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your wheel giveaway platform</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-green-700 font-medium">Settings saved successfully!</p>
          </div>
        )}
        
        {saveStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-red-700 font-medium">Failed to save settings. Please try again.</p>
          </div>
        )}

        {/* Platform Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
              <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="bg-input border-border text-foreground"
                  placeholder="The Wheel Decides"
              />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                  id="contactEmail"
                type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="bg-input border-border text-foreground"
                  placeholder="contact@yourplatform.com"
              />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platformDescription">Platform Description</Label>
              <Textarea
                id="platformDescription"
                value={settings.platformDescription}
                onChange={(e) => setSettings({ ...settings, platformDescription: e.target.value })}
                className="bg-input border-border text-foreground"
                rows={2}
                placeholder="Describe your platform..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Game Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultEntries">Default Entries Per User</Label>
                <Input
                  id="defaultEntries"
                  type="number"
                  min="1"
                  value={settings.defaultEntriesPerUser}
                  onChange={(e) => setSettings({ ...settings, defaultEntriesPerUser: Number.parseInt(e.target.value) || 1 })}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">Entries given to new users</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEntries">Max Entries Per User</Label>
                <Input
                  id="maxEntries"
                  type="number"
                  min="1"
                  value={settings.maxEntriesPerUser}
                  onChange={(e) => setSettings({ ...settings, maxEntriesPerUser: Number.parseInt(e.target.value) || 1000 })}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">Maximum entries a user can have</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Entry Values by Item</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entriesPerShirt">T-Shirt Entries</Label>
                  <Input
                    id="entriesPerShirt"
                    type="number"
                    min="1"
                    value={settings.entriesPerShirt}
                    onChange={(e) => setSettings({ ...settings, entriesPerShirt: Number.parseInt(e.target.value) || 10 })}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entriesPerHoodie">Hoodie Entries</Label>
                  <Input
                    id="entriesPerHoodie"
                    type="number"
                    min="1"
                    value={settings.entriesPerHoodie}
                    onChange={(e) => setSettings({ ...settings, entriesPerHoodie: Number.parseInt(e.target.value) || 20 })}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entriesPerCap">Cap Entries</Label>
                  <Input
                    id="entriesPerCap"
                    type="number"
                    min="1"
                    value={settings.entriesPerCap}
                    onChange={(e) => setSettings({ ...settings, entriesPerCap: Number.parseInt(e.target.value) || 5 })}
                    className="bg-input border-border text-foreground"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wheel Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Wheel & Prize Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPrize">Default Prize</Label>
                <Input
                  id="defaultPrize"
                  value={settings.defaultPrize}
                  onChange={(e) => setSettings({ ...settings, defaultPrize: e.target.value })}
                  className="bg-input border-border text-foreground"
                  placeholder="Mystery Prize"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wheelSpinDuration">Wheel Spin Duration (seconds)</Label>
                <Input
                  id="wheelSpinDuration"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.wheelSpinDuration}
                  onChange={(e) => setSettings({ ...settings, wheelSpinDuration: Number.parseInt(e.target.value) || 5 })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeDescription">Prize Description</Label>
              <Textarea
                id="prizeDescription"
                value={settings.prizeDescription}
                onChange={(e) => setSettings({ ...settings, prizeDescription: e.target.value })}
                className="bg-input border-border text-foreground"
                rows={2}
                placeholder="Describe the current prize..."
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Spin</Label>
                <p className="text-sm text-muted-foreground">Enable automatic wheel spinning</p>
              </div>
              <Switch
                checked={settings.autoSpinEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSpinEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the platform</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send email alerts to admins</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS alerts for important events</p>
                  </div>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>Winner Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify when someone wins</p>
                  </div>
                </div>
                <Switch
                  checked={settings.winnerNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, winnerNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>New User Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify when new users register</p>
                  </div>
                </div>
                <Switch
                  checked={settings.newUserNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, newUserNotifications: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shopify Integration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Shopify Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Shopify Integration</Label>
                <p className="text-sm text-muted-foreground">Connect with your Shopify store</p>
              </div>
              <Switch
                checked={settings.shopifyEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, shopifyEnabled: checked })}
              />
            </div>

            {settings.shopifyEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopifyStoreUrl">Shopify Store URL</Label>
                  <Input
                    id="shopifyStoreUrl"
                    value={settings.shopifyStoreUrl}
                    onChange={(e) => setSettings({ ...settings, shopifyStoreUrl: e.target.value })}
                    className="bg-input border-border text-foreground"
                    placeholder="https://your-store.myshopify.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopifyApiKey">Shopify API Key</Label>
                  <Input
                    id="shopifyApiKey"
                    type="password"
                    value={settings.shopifyApiKey}
                    onChange={(e) => setSettings({ ...settings, shopifyApiKey: e.target.value })}
                    className="bg-input border-border text-foreground"
                    placeholder="Your Shopify API key"
                  />
                </div>

            <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    value={settings.shopifyWebhookSecret}
                    onChange={(e) => setSettings({ ...settings, shopifyWebhookSecret: e.target.value })}
                className="bg-input border-border text-foreground"
                    placeholder="Your webhook secret"
                  />
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Setup Instructions:</p>
                      <p>1. Create a private app in your Shopify admin</p>
                      <p>2. Enable webhooks for order creation</p>
                      <p>3. Use the webhook URL: <code className="bg-blue-100 px-1 rounded">/api/shopify/webhook</code></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Verification Required</Label>
                <p className="text-sm text-muted-foreground">Require email verification for new users</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Multiple Accounts</Label>
                <p className="text-sm text-muted-foreground">Allow users to create multiple accounts</p>
              </div>
              <Switch
                checked={settings.allowMultipleAccounts}
                onCheckedChange={(checked) => setSettings({ ...settings, allowMultipleAccounts: checked })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({ ...settings, maxLoginAttempts: Number.parseInt(e.target.value) || 5 })}
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="1"
                  max="168"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: Number.parseInt(e.target.value) || 24 })}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? "Saving Settings..." : "Save All Settings"}
          </Button>
          
          <Button 
            onClick={handleReset} 
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNav />
    </div>
  )
}
