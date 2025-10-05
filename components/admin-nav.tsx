"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Settings, Timer } from "lucide-react"

export function AdminNav() {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "Participants", path: "/admin/participants" },
    { icon: Timer, label: "Game Control", path: "/admin/game-control" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
