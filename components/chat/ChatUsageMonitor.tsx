"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, TrendingUp, Zap, Eye } from "lucide-react"
import { chatAPI } from "@/lib/api"
import { toast } from "sonner" // Assuming toast is imported for error handling

interface ChatUsageMonitorProps {
  chatId: string
  className?: string
}

export default function ChatUsageMonitor({ chatId, className = "" }: ChatUsageMonitorProps) {
  const [usageData, setUsageData] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsageData()
  }, [chatId])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      const [usageResponse, chartResponse] = await Promise.all([
        chatAPI.getUsageSummary(chatId),
        chatAPI.getUsageChartData(chatId),
      ])
      setUsageData(usageResponse.data)
      setChartData(chartResponse.data)
    } catch (error) {
      console.error("Failed to fetch usage data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAnalytics = () => {
    try {
      window.location.href = `/analytics?chat=${chatId}`
    } catch (error) {
      console.error("[v0] Navigation error:", error)
      toast.error("Failed to navigate to analytics")
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Usage Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usageData) {
    return null
  }

  const usagePercentage = usageData.limits_and_status?.usage_percentage || 0
  const canContinue = usageData.limits_and_status?.can_continue ?? true
  const tokensRemaining = usageData.limits_and_status?.tokens_remaining || 0

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Usage Monitor</CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewAnalytics}>
            <Eye className="w-3 h-3 mr-1" />
            Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Token Usage</span>
            <span className="text-sm text-gray-600">{usagePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{usageData.total_tokens?.toLocaleString() || 0} used</span>
            <span>{tokensRemaining.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <Zap className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-blue-600">Total Cost</p>
              <p className="text-sm font-semibold text-blue-700">${usageData.total_cost?.toFixed(4) || "0.0000"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-green-600">Messages</p>
              <p className="text-sm font-semibold text-green-700">{usageData.message_count || 0}</p>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        {usageData.efficiency_metrics && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Efficiency</span>
              <Badge
                variant={
                  usageData.efficiency_metrics.efficiency_rating === "excellent"
                    ? "default"
                    : usageData.efficiency_metrics.efficiency_rating === "good"
                      ? "secondary"
                      : "outline"
                }
              >
                {usageData.efficiency_metrics.efficiency_rating}
              </Badge>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Avg tokens/message:</span>
                <span>{usageData.usage_breakdown?.average_tokens_per_message?.toFixed(1) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per 1K tokens:</span>
                <span>${usageData.efficiency_metrics.cost_per_1k_tokens?.toFixed(2) || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {!canContinue && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-700">Token limit reached</p>
              <p className="text-xs text-red-600">This chat cannot continue</p>
            </div>
          </div>
        )}

        {usagePercentage > 80 && canContinue && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-700">High usage warning</p>
              <p className="text-xs text-yellow-600">Approaching token limit</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
