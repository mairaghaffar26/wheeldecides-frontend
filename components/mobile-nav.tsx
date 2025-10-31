"use client"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Home, Users, User, ShoppingBag } from "lucide-react"

export function MobileNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const isGuest = user?.isGuest || false

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard", guestAllowed: true },
    { icon: ShoppingBag, label: "Store", path: "/store", guestAllowed: false },
    { icon: Users, label: "Game Status", path: "/game-status", guestAllowed: true },
    { icon: User, label: "Profile", path: "/profile", guestAllowed: false },
  ]

  const handleNavClick = (item: typeof navItems[0]) => {
    if (isGuest && !item.guestAllowed) {
      // Redirect to registration for restricted pages
      router.push("/register")
      return
    }
    router.push(item.path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path
          const isRestricted = isGuest && !item.guestAllowed

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 relative ${
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              } ${isRestricted ? "opacity-60" : ""}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
              {isRestricted && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
