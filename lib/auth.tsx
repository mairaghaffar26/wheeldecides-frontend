"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiService, type User, type RegisterData } from "./api"

export type UserRole = "user" | "super_admin"

export interface User {
  id: string
  name: string
  email: string
  instagramHandle: string
  country: string
  role: UserRole
  totalEntries: number
  totalShirtsPurchased: number
  isWinner: boolean
  lastWinDate?: string
  avatar?: string
  createdAt: string
  congratsShown?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  isLoading: boolean
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
        
        if (storedUser && token) {
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await apiService.login(email, password)
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
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
