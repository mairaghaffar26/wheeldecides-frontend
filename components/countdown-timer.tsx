"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { socketService } from "@/lib/socket"

interface CountdownTimerProps {
  gameSettings?: {
    currentPrize?: string
    spinCountdownDays?: number
    spinCountdownHours?: number
    spinCountdownMinutes?: number
    gameStartTime?: string
    gameEndTime?: string
    countdownActive?: boolean
  }
  loading?: boolean
}

export function CountdownTimer({ gameSettings, loading = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isLiveCountdown, setIsLiveCountdown] = useState(false)

  useEffect(() => {
    // Connect to socket and join wheel room
    socketService.connect()
    socketService.joinWheelRoom()

    // Listen for real-time countdown updates
    const handleCountdownUpdate = (data: any) => {
      if (data.timeRemaining > 0) {
        const days = Math.floor(data.timeRemaining / (1000 * 60 * 60 * 24))
        const hours = Math.floor((data.timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((data.timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((data.timeRemaining % (1000 * 60)) / 1000)
        
        setTimeLeft({ days, hours, minutes, seconds })
        setIsLiveCountdown(true)
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setIsLiveCountdown(false)
      }
    }

    socketService.onCountdownUpdate(handleCountdownUpdate)

    // Fallback to static countdown if no live countdown
    if (!gameSettings) return

    const interval = setInterval(() => {
      // Only use static countdown if no live countdown is active
      if (!isLiveCountdown) {
        let targetTime: Date

        // Use game session end time if countdown is active, otherwise use static countdown
        if (gameSettings.countdownActive && gameSettings.gameEndTime) {
          targetTime = new Date(gameSettings.gameEndTime)
        } else {
          // Fallback to static countdown
          targetTime = new Date()
          targetTime.setDate(targetTime.getDate() + (gameSettings.spinCountdownDays || 0))
          targetTime.setHours(targetTime.getHours() + (gameSettings.spinCountdownHours || 0))
          targetTime.setMinutes(targetTime.getMinutes() + (gameSettings.spinCountdownMinutes || 0))
        }

        const now = new Date().getTime()
        const distance = targetTime.getTime() - now

        if (distance > 0) {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
          })
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        }
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      socketService.removeListener('countdown-update', handleCountdownUpdate)
    }
  }, [gameSettings, isLiveCountdown])

  if (loading) {
    return (
      <div className="text-center mb-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6
  const timerColor = isUrgent ? "text-red-400" : "text-yellow-400"
  const iconColor = isUrgent ? "text-red-400" : "text-yellow-400"
  const bgColor = isUrgent ? "bg-red-500/20" : "bg-yellow-500/20"

  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className={`p-2 ${bgColor} rounded-full`}>
          <Clock className={`h-5 w-5 ${iconColor}`} />
        </div>
            <h3 className="font-semibold text-foreground text-lg">
              {isLiveCountdown ? "Current Game Session" : 
               gameSettings?.countdownActive ? "Current Game Session" : "Next Wheel Spin"}
            </h3>
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="text-center">
          <div className={`text-2xl font-bold ${timerColor}`}>{timeLeft.days.toString().padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">Days</div>
        </div>
        <div className={`${timerColor} text-xl`}>:</div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${timerColor}`}>{timeLeft.hours.toString().padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">Hours</div>
        </div>
        <div className={`${timerColor} text-xl`}>:</div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${timerColor}`}>{timeLeft.minutes.toString().padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">Min</div>
        </div>
        <div className={`${timerColor} text-xl`}>:</div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${timerColor}`}>{timeLeft.seconds.toString().padStart(2, "0")}</div>
          <div className="text-xs text-muted-foreground">Sec</div>
        </div>
      </div>
      {isUrgent && <p className="text-xs text-red-400 mt-2 animate-pulse">⚠️ Final hours! Admin will spin soon!</p>}
      {gameSettings?.currentPrize && (
        <p className="text-sm text-muted-foreground mt-2">
          Prize: <span className="font-medium text-foreground">{gameSettings.currentPrize}</span>
        </p>
      )}
    </div>
  )
}
