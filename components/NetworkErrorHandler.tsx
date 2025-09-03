"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"

interface NetworkErrorHandlerProps {
  onRetry?: () => void
  className?: string
}

export default function NetworkErrorHandler({ onRetry, className = "" }: NetworkErrorHandlerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineAlert, setShowOfflineAlert] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineAlert(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineAlert(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial state
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setShowOfflineAlert(true)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showOfflineAlert) {
    return null
  }

  return (
    <Alert className={`border-red-200 bg-red-50 ${className}`} variant="destructive">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WifiOff className="w-5 h-5" />
          <div>
            <h4 className="font-semibold text-sm">Connection Lost</h4>
            <AlertDescription className="text-sm">
              You're currently offline. Please check your internet connection and try again.
            </AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            {isOnline ? <Wifi className="w-3 h-3 text-green-600" /> : <WifiOff className="w-3 h-3 text-red-600" />}
            <span className={isOnline ? "text-green-600" : "text-red-600"}>{isOnline ? "Online" : "Offline"}</span>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} disabled={!isOnline}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}
