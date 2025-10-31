"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function EntryPage() {
  const router = useRouter()
  const { user, isLoading, setGuestMode } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Set guest mode and redirect to dashboard
        setGuestMode()
      }
      // Redirect to dashboard for both guest and authenticated users
      router.push("/dashboard")
    }
  }, [user, isLoading, router, setGuestMode])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
