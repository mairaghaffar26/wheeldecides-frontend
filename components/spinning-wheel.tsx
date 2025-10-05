"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { apiService } from "@/lib/api"

interface WheelEntry {
  userId: string
  userName: string
  instagramHandle: string
}

export function SpinningWheel() {
  const { user } = useAuth()
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wheelEntries, setWheelEntries] = useState<WheelEntry[]>([])
  const [totalEntries, setTotalEntries] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWheelEntries = async () => {
      try {
        const data = await apiService.getWheelEntries()
        setWheelEntries(data.entries || [])
        setTotalEntries(data.totalEntries || 0)
      } catch (error) {
        console.error('Error fetching wheel entries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWheelEntries()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchWheelEntries, 30000)
    return () => clearInterval(interval)
  }, [])

  // Create wheel segments based on participants and their entries
  const createWheelSegments = () => {
    const segments: string[] = []
    wheelEntries.forEach((entry) => {
      segments.push(entry.userName)
    })
    return segments
  }

  const segments = createWheelSegments()
  const segmentAngle = segments.length > 0 ? 360 / segments.length : 0

  // Auto-spin animation every 30 seconds (less frequent for better UX)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSpinning && segments.length > 0) {
        setIsSpinning(true)
        const newRotation = rotation + 360 + Math.random() * 360
        setRotation(newRotation)

        setTimeout(() => {
          setIsSpinning(false)
        }, 3000)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [rotation, isSpinning, segments.length])

  const getSegmentColor = (index: number, name: string) => {
    // Highlight user's segments in primary color
    if (name === user?.name) {
      return "fill-primary"
    }
    // Alternate colors for other segments
    const colors = ["fill-chart-2", "fill-chart-3", "fill-chart-4", "fill-chart-5", "fill-chart-6"]
    return colors[index % colors.length]
  }

  const getTextColor = (name: string) => {
    return name === user?.name ? "fill-primary-foreground" : "fill-foreground"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (segments.length === 0) {
    return (
      <div className="text-center space-y-4">
        <div className="w-80 h-80 bg-muted rounded-full flex items-center justify-center">
          <p className="text-muted-foreground">No participants yet</p>
        </div>
        <p className="text-sm text-muted-foreground">Be the first to join the wheel!</p>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-80 h-80">
        {/* Wheel SVG */}
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className={`transform transition-transform duration-3000 ease-out ${isSpinning ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {segments.map((name, index) => {
            const startAngle = index * segmentAngle
            const endAngle = (index + 1) * segmentAngle
            const startAngleRad = (startAngle * Math.PI) / 180
            const endAngleRad = (endAngle * Math.PI) / 180

            const x1 = 160 + 140 * Math.cos(startAngleRad)
            const y1 = 160 + 140 * Math.sin(startAngleRad)
            const x2 = 160 + 140 * Math.cos(endAngleRad)
            const y2 = 160 + 140 * Math.sin(endAngleRad)

            const largeArcFlag = segmentAngle > 180 ? 1 : 0

            const pathData = [`M 160 160`, `L ${x1} ${y1}`, `A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

            const textAngle = startAngle + segmentAngle / 2
            const textAngleRad = (textAngle * Math.PI) / 180
            const textX = 160 + 100 * Math.cos(textAngleRad)
            const textY = 160 + 100 * Math.sin(textAngleRad)

            return (
              <g key={`${name}-${index}`}>
                <path d={pathData} className={`${getSegmentColor(index, name)} stroke-border stroke-2`} />
                <text
                  x={textX}
                  y={textY}
                  className={`${getTextColor(name)} text-sm font-medium`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  {name.length > 8 ? name.substring(0, 8) + "..." : name}
                </text>
              </g>
            )
          })}

          {/* Center circle */}
          <circle cx="160" cy="160" r="20" className="fill-primary stroke-border stroke-2" />
        </svg>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
        </div>
      </div>

      {/* Spinning indicator */}
      {isSpinning && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium pulse-glow">
            Spinning...
          </div>
        </div>
      )}

      {/* Wheel Stats */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-muted-foreground">
          {totalEntries} total entries • Your entries: {user?.totalEntries || 0}
        </p>
      </div>
    </div>
  )
}
