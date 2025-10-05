"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [loginType, setLoginType] = useState<"user" | "admin">("user")

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const success = await login(email, password)

      if (success) {
        // Check user role and redirect accordingly
        const token = localStorage.getItem("accessToken")
        if (token) {
          try {
            const tokenData = await apiService.checkToken(token)
            const userRole = tokenData.payload?.user?.role
            
            if (userRole === "super_admin") {
              router.push("/admin/dashboard")
            } else {
              router.push("/dashboard")
            }
          } catch (error) {
            // Fallback redirect
            router.push("/dashboard")
          }
        } else {
          router.push("/dashboard")
        }
      } else {
        setError("Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error('Login error:', error)
      setError("Login failed. Please check your credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }
    router.push(`/forgot-password?email=${encodeURIComponent(email)}&type=${loginType}`)
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
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-balance">
              Sign in to continue your experience
            </p>
          </div>
        </div>

        {/* Login Type Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginType("user")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === "user"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => setLoginType("admin")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginType === "admin"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Login Form */}
        <Card className="border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">
              {loginType === "admin" ? "Admin Sign In" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {loginType === "admin" 
                ? "Enter your SuperAdmin credentials" 
                : "Enter your email and password to access your dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={loginType === "admin" ? "admin@thewheeldecides.com" : "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="link"
                onClick={handleForgotPassword}
                className="p-0 h-auto text-muted-foreground hover:text-foreground"
              >
                Forgot Password?
              </Button>
            </div>

            {/* Demo Credentials for Admin */}
            {loginType === "admin" && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>SuperAdmin credentials:</p>
                <p>Email: admin@thewheeldecides.com</p>
                <p>Password: SuperAdmin123!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registration Link for Users */}
        {loginType === "user" && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => router.push("/")}
              className="p-0 h-auto text-muted-foreground hover:text-foreground"
            >
              Don't have an account? Register here
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
