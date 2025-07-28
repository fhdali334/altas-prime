"use client"

import { useState } from "react"
import { useAuth } from "@/context/authContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"

type AuthMode = "login" | "register" | "forgot-password"

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {mode === "login" && (
            <LoginForm onToggleMode={() => setMode("register")} onForgotPassword={() => setMode("forgot-password")} />
          )}
          {mode === "register" && <RegisterForm onToggleMode={() => setMode("login")} />}
          {mode === "forgot-password" && <ForgotPasswordForm onBack={() => setMode("login")} />}
        </div>
      </div>
    </div>
  )
}
