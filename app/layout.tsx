import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth"
import { Suspense } from "react"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "Wheel Decides - Gamified Giveaway Platform",
  description: "Join the ultimate gamified giveaway experience with Wheel Decides",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} dark`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Analytics />
        
        {/* Popup Ads - Adsterra */}
        <Script
          id="adsterra-popup"
          strategy="afterInteractive"
          src="https://pl27963606.effectivegatecpm.com/64/e8/48/64e848b354cdefa1bc4b4c43b3de20f3.js"
        />
        
        {/* Social Bar Ads - Adsterra */}
        <Script
          id="adsterra-social"
          strategy="afterInteractive"
          src="https://pl27963610.effectivegatecpm.com/82/d3/8c/82d38c318f35346ac68a9dc7e4e71974.js"
        />
      </body>
    </html>
  )
}
