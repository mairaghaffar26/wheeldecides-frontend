"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, CheckCircle, AlertCircle, Lock } from "lucide-react"
import { AdminNav } from "@/components/admin-nav"
import { globalLogoutService } from "@/lib/global-logout"

export default function ChangePasswordPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.push("/admin/login")
    }

    // Register for global logout events
    const unsubscribeLogout = globalLogoutService.registerLogoutCallback(() => {
      // Clear any local state
      setEmailSent(false)
      setError("")
    })

    return () => {
      unsubscribeLogout()
    }
  }, [user, isLoading, router])

  const handleRequestVerification = async () => {
    setError("")
    setIsSubmitting(true)

    try {
      await apiService.requestPasswordChangeVerification()
      setEmailSent(true)
    } catch (error) {
      console.error('Request verification error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send verification email')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Change Password</h1>
              <p className="text-sm text-muted-foreground">SuperAdmin Account</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="max-w-md mx-auto">
            {/* Success Card */}
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Password Changed!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your SuperAdmin password has been updated successfully.
                </p>
                <Button
                  onClick={() => router.push("/admin/dashboard")}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <AdminNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Change Password</h1>
            <p className="text-sm text-muted-foreground">SuperAdmin Account</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Change Password Form */}
          <Card className="border-border bg-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-card-foreground flex items-center justify-center gap-2">
                <Lock className="h-6 w-6" />
                Change Password
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Update your SuperAdmin password for security
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!emailSent ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      For security reasons, password changes require email verification. 
                      Click the button below to receive a verification link.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleRequestVerification}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Verification Email...
                      </>
                    ) : (
                      "Send Verification Email"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Verification Email Sent!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We've sent a verification link to <strong>{user?.email}</strong>. 
                      Please check your email and click the link to complete the password change.
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      The verification link will expire in 15 minutes for security reasons.
                    </p>
                  </div>

                  <Button
                    onClick={() => setEmailSent(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Note */}
          <Card className="mt-4 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Security Note</h4>
                  <p className="text-xs text-blue-700">
                    Password changes require email verification for enhanced security. The verification link expires in 15 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AdminNav />
    </div>
  )
}
