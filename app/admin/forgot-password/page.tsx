"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import { apiService } from "@/lib/api"
import Image from "next/image"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await apiService.requestPasswordReset(email)
      setIsSuccess(true)
    } catch (error) {
      console.error('Password reset request error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setIsSubmitting(false)
    }
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
              <h1 className="text-3xl font-bold text-foreground">Check Your Email</h1>
              <p className="text-muted-foreground text-balance">
                We've sent a password reset link to your email address.
              </p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Email Sent!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Please check your email and click the reset link to continue.
              </p>
              <p className="text-xs text-muted-foreground">
                The link will expire in 1 hour for security reasons.
              </p>
            </CardContent>
          </Card>

          {/* Back to Login */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => router.push("/admin/login")}
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Login
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
            <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
            <p className="text-muted-foreground text-balance">
              Enter your SuperAdmin email address and we'll send you a reset link.
            </p>
          </div>
        </div>

        {/* Forgot Password Form */}
        <Card className="border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">Reset Password</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your SuperAdmin email to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  SuperAdmin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@thewheeldecides.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
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
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Button
            variant="link"
            onClick={() => router.push("/admin/login")}
            className="p-0 h-auto text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Login
          </Button>
        </div>
      </div>
    </div>
  )
}
