"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageSquare, Clock, DollarSign, Zap } from "lucide-react"
import { chatAPI, analyticsAPI } from "@/lib/api"
import { toast } from "sonner"

interface ChatNavigationProps {
  chatId: string
  onRealTimeUpdate?: (data: any) => void
}

export default function ChatNavigation({ chatId, onRealTimeUpdate }: ChatNavigationProps) {
  const router = useRouter()
  const [chatInfo, setChatInfo] = useState<any>(null)
  const [realTimeData, setRealTimeData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchChatInfo()
  }, [chatId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const pollRealTimeData = async () => {
      try {
        const response = await analyticsAPI.getRealtime(chatId)
        setRealTimeData(response.data)
        if (onRealTimeUpdate) {
          onRealTimeUpdate(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch real-time data:", error)
      }
    }

    // Initial fetch
    pollRealTimeData()

    // Poll every 5 seconds
    interval = setInterval(pollRealTimeData, 5000)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [chatId, onRealTimeUpdate])

  const fetchChatInfo = async () => {
    try {
      setIsLoading(true)
      const response = await chatAPI.getById(chatId, { limit: 1 })
      setChatInfo(response.data)
    } catch (error) {
      console.error("Failed to fetch chat info:", error)
      toast.error("Failed to load chat information")
    } finally {
      setIsLoading(false)
    }
  }

  const getWarningColor = (warningLevel: string) => {
    switch (warningLevel) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border-b border-gray-200 gap-3">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">{chatInfo?.title || "Chat"}</h1>
          {chatInfo?.agent_name && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {chatInfo.agent_name}
            </p>
          )}
        </div>
      </div>

      {realTimeData && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded">
            <Zap className="w-3 h-3 text-blue-600" />
            <span className="text-blue-700 font-medium">{realTimeData.total_chat_tokens?.toLocaleString() || 0}</span>
            <span className="text-blue-600">tokens</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-green-700 font-medium">${realTimeData.total_chat_cost?.toFixed(4) || "0.0000"}</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-gray-700 font-medium">{realTimeData.percentage_used?.toFixed(1) || 0}%</span>
          </div>

          {realTimeData.warning_level && realTimeData.warning_level !== "none" && (
            <Badge variant={getWarningColor(realTimeData.warning_level)} className="text-xs">
              {realTimeData.warning_level.toUpperCase()}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
