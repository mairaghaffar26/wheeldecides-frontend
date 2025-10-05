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
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, ExternalLink, Ticket, Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export default function Store() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [gameSettings, setGameSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseCode, setPurchaseCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchGameSettings = async () => {
      try {
        setLoading(true)
        const settings = await apiService.getGameSettings()
        setGameSettings(settings)
      } catch (error) {
        console.error('Error fetching game settings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchGameSettings()
    }
  }, [user])

  const handleShopifyRedirect = () => {
    const shopifyUrl = gameSettings?.shopifyStoreUrl || ''
    if (shopifyUrl) {
      window.open(shopifyUrl, '_blank')
    } else {
      setVerificationMessage('Shopify store URL not configured. Please contact admin.')
      setMessageType('error')
    }
  }

  const handleCodeVerification = async () => {
    if (!purchaseCode.trim()) {
      setVerificationMessage('Please enter a purchase code')
      setMessageType('error')
      return
    }

    try {
      setVerifying(true)
      setVerificationMessage('')
      const result = await apiService.verifyPurchaseCode(purchaseCode.trim())
      
      setVerificationMessage(
        `Success! You received ${result.entriesAwarded} entries. Your total entries: ${result.newTotalEntries}`
      )
      setMessageType('success')
      setPurchaseCode('')
      
      // Auto redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      
    } catch (error: any) {
      console.error('Code verification error:', error)
      setVerificationMessage(error.message || 'Invalid purchase code. Please try again.')
      setMessageType('error')
    } finally {
      setVerifying(false)
    }
  }

  const clearMessage = () => {
    setVerificationMessage('')
    setMessageType('')
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
            <h1 className="text-xl font-bold text-foreground">Store</h1>
            <p className="text-sm text-muted-foreground">Purchase shirts to earn wheel entries</p>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {user?.totalEntries || 0} entries
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* How It Works */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              How to Get More Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">1</Badge>
              <p className="text-sm text-muted-foreground">
                Click "Buy Shirts" to visit our Shopify store
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">2</Badge>
              <p className="text-sm text-muted-foreground">
                Complete your purchase on Shopify
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">3</Badge>
              <p className="text-sm text-muted-foreground">
                We'll email you a unique verification code
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="min-w-6 h-6 rounded-full flex items-center justify-center text-xs">4</Badge>
              <p className="text-sm text-muted-foreground">
                Enter your code below to claim <strong>10 wheel entries per shirt!</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Shirts Button */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Step 1: Purchase Shirts</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visit our Shopify store to browse and buy shirts
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleShopifyRedirect}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
              disabled={!gameSettings?.shopifyStoreUrl}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              <span className="mr-2">Visit Shopify Store</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            {!gameSettings?.shopifyStoreUrl && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Store URL not configured yet
              </p>
            )}
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Code Verification */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Step 2: Verify Your Purchase</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the verification code from your email
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseCode" className="text-sm font-medium">
                Purchase Verification Code
              </Label>
              <Input
                id="purchaseCode"
                type="text"
                placeholder="Enter your 8-digit code (e.g., ABC123XY)"
                value={purchaseCode}
                onChange={(e) => {
                  setPurchaseCode(e.target.value.toUpperCase())
                  clearMessage()
                }}
                className="font-mono text-center tracking-wider"
                maxLength={8}
                disabled={verifying}
              />
            </div>

            {/* Verification Message */}
            {verificationMessage && (
              <div className={`p-3 rounded-lg flex items-start gap-2 ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 text-sm">
                  <p>{verificationMessage}</p>
                  {messageType === 'success' && (
                    <p className="mt-1 text-xs opacity-75">
                      Redirecting to dashboard in 3 seconds...
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleCodeVerification}
              disabled={verifying || !purchaseCode.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Code & Claim Entries
                </>
              )}
            </Button>

            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Reward:</strong> Each shirt purchase = 10 wheel entries<br/>
                <strong>Current entries:</strong> {user?.totalEntries || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Purchase History */}
        {user?.totalShirtsPurchased > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Your Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">{user.totalShirtsPurchased}</div>
                <p className="text-sm text-muted-foreground">Shirts Purchased</p>
                <p className="text-sm text-muted-foreground">
                  Total earned: {user.totalShirtsPurchased * 10} entries
                </p>
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
