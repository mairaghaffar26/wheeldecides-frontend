"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService, type User, type RegisterData } from "./api"

export type UserRole = "user" | "super_admin"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  setGuestMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user")
        const token = localStorage.getItem("accessToken")
        const isGuest = localStorage.getItem("guestMode")
        
        if (isGuest === "true") {
          // Set guest user
          setUser({
            id: "guest",
            name: "Guest",
            email: "",
            instagramHandle: "",
            country: "",
            role: "user",
            totalEntries: 0,
            totalShirtsPurchased: 0,
            isWinner: false,
            createdAt: new Date().toISOString(),
            isGuest: true
          })
        } else if (storedUser && token) {
          // Verify token is still valid by fetching current user
          const currentUser = await apiService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        // Token is invalid, clear storage
        localStorage.removeItem("user")
        localStorage.removeItem("accessToken")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const setGuestMode = () => {
    localStorage.setItem("guestMode", "true")
    setUser({
      id: "guest",
      name: "Guest",
      email: "",
      instagramHandle: "",
      country: "",
      role: "user",
      totalEntries: 0,
      totalShirtsPurchased: 0,
      isWinner: false,
      createdAt: new Date().toISOString(),
      isGuest: true
    })
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await apiService.login(email, password)
      // Clear guest mode on successful login
      localStorage.removeItem("guestMode")
      setUser(response.user)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await apiService.register(userData)
      // Clear guest mode on successful registration
      localStorage.removeItem("guestMode")
      setUser(response.user)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Registration error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    apiService.logout()
    localStorage.removeItem("guestMode")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading, setGuestMode }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
