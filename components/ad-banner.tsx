"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

interface AdBannerProps {
  className?: string
}

let bannerCounter = 0

export function AdBanner({ className = "" }: AdBannerProps) {
  const [bannerId] = useState(() => {
    bannerCounter++
    return `adsterra-banner-${bannerCounter}-${Date.now()}`
  })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Create unique ad configuration for this banner instance
    const scriptId = `invoke-${bannerId}`
    
    // Only load if not already loaded
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.type = 'text/javascript'
      script.async = true
      
      // Create unique atOptions for this instance
      const atOptionsScript = document.createElement('script')
      atOptionsScript.type = 'text/javascript'
      atOptionsScript.innerHTML = `
        atOptions = {
          'key': 'dbb45323511b60c687fcefb349c27696',
          'format': 'iframe',
          'height': 50,
          'width': 320,
          'params': {}
        };
      `
      
      script.src = 'https://www.highperformanceformat.com/dbb45323511b60c687fcefb349c27696/invoke.js'
      
      if (containerRef.current) {
        containerRef.current.appendChild(atOptionsScript)
        containerRef.current.appendChild(script)
      }
    }
  }, [bannerId])

  return (
    <div className={`flex justify-center items-center my-4 ${className}`}>
      <div 
        ref={containerRef}
        id={bannerId}
        className="ad-banner" 
        style={{ minHeight: '50px', width: '320px' }}
      />
    </div>
  )
}
