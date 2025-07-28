"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/authContext"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyEmail } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. No token provided.")
      return
    }

    const verify = async () => {
      try {
        await verifyEmail(token)
        setStatus("success")
        setMessage("Email verified successfully! You can now login.")
      } catch (error: any) {
        setStatus("error")
        setMessage(error.response?.data?.detail || "Email verification failed. Please try again.")
      }
    }

    verify()
  }, [searchParams, verifyEmail])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            {status === "loading" && (
              <div className="flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Verifying Email</h1>
                <p className="text-gray-600 mt-2">Please wait while we verify your email...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center">
                <XCircle className="w-16 h-16 text-red-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
              </div>
            )}
          </div>

          {status !== "loading" && (
            <Alert
              className={`mb-6 ${status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              <AlertDescription className={status === "success" ? "text-green-600" : "text-red-600"}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {status !== "loading" && (
            <Button onClick={() => router.push("/auth")} className="w-full">
              Go to Login
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
