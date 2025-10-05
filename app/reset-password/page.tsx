"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { apiService } from "@/lib/api"
import Image from "next/image"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid reset link")
        setIsVerifying(false)
        return
      }

      try {
        // For now, we'll assume the token is valid if it exists
        // In a real implementation, you might want to verify the token with the backend
        setTokenValid(true)
      } catch (error) {
        console.error('Token verification error:', error)
        setError("Invalid or expired reset link")
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!token) {
      setError("Invalid reset link")
      return
    }

    setIsSubmitting(true)

    try {
      await apiService.resetPassword(token, newPassword, confirmPassword)
      setIsSuccess(true)
    } catch (error) {
      console.error('Password reset error:', error)
      setError(error instanceof Error ? error.message : 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image src="/logo.png" alt="Wheel Decides Logo" width={120} height={120} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Password Reset Successful!</h1>
              <p className="text-muted-foreground text-balance">
                Your password has been updated successfully.
              </p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Password Updated!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You can now log in with your new password.
              </p>
            </CardContent>
          </Card>

          {/* Back to Login */}
          <div className="text-center">
            <Button
              onClick={() => router.push("/unified-login")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image src="/logo.png" alt="Wheel Decides Logo" width={120} height={120} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Invalid Reset Link</h1>
              <p className="text-muted-foreground text-balance">
                This password reset link is invalid or has expired.
              </p>
            </div>
          </div>

          {/* Error Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Link Expired</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Password reset links expire after 1 hour for security reasons.
              </p>
            </CardContent>
          </Card>

          {/* Back to Forgot Password */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => router.push("/forgot-password")}
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              Request a new reset link
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Wheel Decides Logo" width={120} height={120} className="rounded-lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground text-balance">
              Enter your new password
            </p>
          </div>
        </div>

        {/* Reset Password Form */}
        <Card className="border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">New Password</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-card-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-card-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-destructive text-sm text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => router.push("/unified-login")}
            className="p-0 h-auto text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  )
}
