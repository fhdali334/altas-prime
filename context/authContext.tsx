"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, tokenManager } from "@/lib/auth-api"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  username: string
  is_verified: boolean
  created_at: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getToken()
      const savedUser = tokenManager.getUser()

      if (token && savedUser) {
        try {
          // Verify token is still valid by fetching user info
          const response = await authService.getMe()
          setUser(response.data)
          tokenManager.setUser(response.data)
        } catch (error) {
          // Token is invalid, clear storage
          tokenManager.removeToken()
          tokenManager.clearUser()
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      const { access_token, user: userData } = response.data

      tokenManager.setToken(access_token)
      tokenManager.setUser(userData)
      setUser(userData)
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, username: string) => {
    try {
      await authService.register({ email, password, username })
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error("Logout error:", error)
    } finally {
      tokenManager.removeToken()
      tokenManager.clearUser()
      setUser(null)
      router.push("/auth")
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token)
    } catch (error) {
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email)
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authService.resetPassword({ token, new_password: newPassword })
    } catch (error) {
      throw error
    }
  }

  const resendVerification = async (email: string) => {
    try {
      await authService.resendVerification(email)
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
