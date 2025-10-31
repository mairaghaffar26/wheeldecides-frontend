"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instagramHandle: "",
    country: "",
    password: "",
    acceptTerms: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.acceptTerms) {
      setError("Please accept the terms and conditions")
      return
    }

    setIsSubmitting(true)

    const success = await register({
      name: formData.name,
      email: formData.email,
      instagramHandle: formData.instagramHandle,
      country: formData.country,
      password: formData.password,
    })

    if (success) {
      // Clear guest mode
      localStorage.removeItem("guestMode")
      router.push("/dashboard")
    } else {
      setError("Registration failed. Please try again.")
    }

    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
            <h1 className="font-bold text-foreground text-4xl">Welcome to</h1>
            <h1 className="text-3xl font-bold text-foreground">The Wheel Decides</h1>
            <p className="text-muted-foreground text-balance">
              Join the ultimate gamified giveaway experience. Spin the wheel and win amazing prizes!
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">Join the Game</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Enter your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-card-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-card-foreground">
                  Instagram Handle
                </Label>
                <Input
                  id="instagram"
                  type="text"
                  placeholder="@yourusername"
                  value={formData.instagramHandle}
                  onChange={(e) => handleInputChange("instagramHandle", e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-card-foreground">
                  Country
                </Label>
                <Input
                  id="country"
                  type="text"
                  placeholder="Enter your country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-card-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-card-foreground">
                  I accept the terms and conditions
                </Label>
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
                    Joining the Game...
                  </>
                ) : (
                  "Spin the Wheel!"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Navigation Links */}
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                onClick={() => router.push("/unified-login")}
                className="p-0 h-auto text-primary hover:text-primary/80"
              >
                Sign in here
              </Button>
            </div>
          </div>
      </div>
    </div>
  )
}
