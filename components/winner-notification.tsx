"use client"

import { useState, useEffect } from "react"
import { Trophy, Sparkles, Gift, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WinnerNotificationProps {
  winner: {
    userName: string
    instagramHandle: string
    winDate: string
    prize: string
    spinId: string
  }
  onClose?: () => void
}

export function WinnerNotification({ winner, onClose }: WinnerNotificationProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger animations on mount
    setShowAnimation(true)
    setShowConfetti(true)
    
    // Auto-hide confetti after 5 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(confettiTimer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
          ))}
        </div>
      )}

      {/* Winner Card */}
      <Card className={`bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-yellow-300 shadow-2xl transform transition-all duration-1000 ${
        showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        <CardContent className="p-8 text-center relative overflow-hidden">
          {/* Background Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <Star
                key={i}
                className="absolute text-white/20 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
                size={16 + Math.random() * 8}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            {/* Trophy Icon */}
            <div className="mb-6 animate-bounce">
              <Trophy className="h-20 w-20 text-white mx-auto drop-shadow-lg" />
            </div>

            {/* Congratulations Text */}
            <h1 className="text-4xl font-bold text-white mb-4 animate-pulse">
              🎉 CONGRATULATIONS! 🎉
            </h1>

            {/* Winner Name */}
            <h2 className="text-2xl font-bold text-white mb-2">
              {winner.userName}
            </h2>

            {/* Instagram Handle */}
            <p className="text-white/90 text-lg mb-4">
              {winner.instagramHandle}
            </p>

            {/* Prize */}
            <div className="bg-white/20 rounded-lg p-4 mb-6 backdrop-blur-sm">
              <Gift className="h-8 w-8 text-white mx-auto mb-2" />
              <p className="text-white font-semibold text-lg">
                You won: {winner.prize}
              </p>
            </div>

            {/* Win Details */}
            <div className="text-white/80 text-sm mb-6">
              <p>Spin ID: {winner.spinId}</p>
              <p>Won on: {new Date(winner.winDate).toLocaleDateString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={onClose}
                className="bg-white text-orange-500 hover:bg-white/90 font-semibold px-6 py-2"
              >
                Close
              </Button>
              <Button
                onClick={() => window.location.href = '/profile'}
                className="bg-white/20 text-white hover:bg-white/30 font-semibold px-6 py-2 backdrop-blur-sm"
              >
                View Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
