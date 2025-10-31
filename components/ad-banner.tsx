"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"

interface AdBannerProps {
  className?: string
}

export function AdBanner({ className = "" }: AdBannerProps) {
  const containerId = useRef(`ad-banner-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    // Set ad options globally for this banner
    if (typeof window !== 'undefined') {
      (window as any).atOptions = {
        'key': 'dbb45323511b60c687fcefb349c27696',
        'format': 'iframe',
        'height': 50,
        'width': 320,
        'params': {}
      }
    }
  }, [])

  return (
    <div className={`flex justify-center items-center my-4 ${className}`}>
      <div id={containerId.current} className="ad-banner" style={{ minHeight: '50px', width: '320px' }}>
        <Script
          id={`adsterra-banner-${containerId.current}`}
          strategy="afterInteractive"
          src="https://www.highperformanceformat.com/dbb45323511b60c687fcefb349c27696/invoke.js"
        />
      </div>
    </div>
  )
}
