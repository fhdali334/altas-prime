"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, X, Zap, DollarSign } from "lucide-react"

interface TokenLimitWarningProps {
  tokensUsed: number
  tokenLimit: number
  cost: number
  warningLevel: "none" | "warning" | "critical"
  onDismiss?: () => void
  className?: string
}

export default function TokenLimitWarning({
  tokensUsed,
  tokenLimit,
  cost,
  warningLevel,
  onDismiss,
  className = "",
}: TokenLimitWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const usagePercentage = (tokensUsed / tokenLimit) * 100
  const tokensRemaining = tokenLimit - tokensUsed

  useEffect(() => {
    if (warningLevel !== "none" && !isDismissed) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [warningLevel, isDismissed])

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!isVisible || warningLevel === "none") {
    return null
  }

  const getAlertVariant = () => {
    switch (warningLevel) {
      case "critical":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "default"
    }
  }

  const getAlertColor = () => {
    switch (warningLevel) {
      case "critical":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const getProgressColor = () => {
    switch (warningLevel) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Alert className={`${getAlertColor()} ${className}`} variant={getAlertVariant()}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-sm">
                {warningLevel === "critical" ? "Token Limit Critical" : "High Token Usage"}
              </h4>
              <AlertDescription className="text-sm mt-1">
                {warningLevel === "critical"
                  ? "You're approaching your token limit. Consider starting a new chat to continue."
                  : "You're using a significant portion of your token allowance for this chat."}
              </AlertDescription>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Token Usage</span>
                <span>{usagePercentage.toFixed(1)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {tokensUsed.toLocaleString()} / {tokenLimit.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />${cost.toFixed(4)}
                </span>
              </div>
            </div>

            {warningLevel === "critical" && (
              <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                <strong>Remaining:</strong> {tokensRemaining.toLocaleString()} tokens
                <br />
                <strong>Estimated messages:</strong> ~{Math.floor(tokensRemaining / 200)} more messages
              </div>
            )}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleDismiss} className="p-1 h-auto">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Alert>
  )
}
