"use client"

import { useState, useEffect } from "react"
import { analyticsAPI } from "@/lib/api"

export interface UsageData {
  user_id: string
  period_start: string
  period_end: string
  total_tokens_used: number
  total_cost: number
  total_chats: number
  total_messages: number
  daily_usage: Array<{
    date: string
    tokens: number
    cost: number
    messages: number
  }>
  agent_usage: Array<{
    agent_id: string | null
    agent_name: string
    tokens: number
    cost: number
    messages: number
  }>
  files_processed: number
  avg_tokens_per_message: number
  avg_cost_per_message: number
  most_expensive_chat: {
    chat_id: string
    title: string
    cost: number
  }
}

export interface DashboardData {
  today: {
    tokens: number
    cost: number
    messages: number
  }
  last_7_days: {
    tokens: number
    cost: number
    messages: number
  }
  last_30_days: {
    tokens: number
    cost: number
    messages: number
  }
  recent_chats: Array<{
    chat_id: string
    title: string
    agent_name: string
    total_tokens: number
    total_cost: number
    message_count: number
    last_activity: string
    can_continue: boolean
  }>
  current_month: {
    cost: number
    tokens: number
    budget_percentage: number
  }
  alerts: {
    active_count: number
    has_critical: boolean
  }
}

export const useAnalytics = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard()
      setDashboardData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data")
    }
  }

  const fetchUsageData = async (params?: {
    period_days?: number
    include_daily_breakdown?: boolean
    include_agent_breakdown?: boolean
  }) => {
    try {
      const response = await analyticsAPI.getUsage(params)
      setUsageData(response.data.usage)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch usage data")
    }
  }

  const fetchRealTimeUsage = async (chatId: string) => {
    try {
      const response = await analyticsAPI.getRealtime(chatId)
      return response.data
    } catch (err: any) {
      console.error("Failed to fetch real-time usage:", err)
      return null
    }
  }

  const fetchChatAnalytics = async (chatId: string, includeMessageBreakdown = true) => {
    try {
      const response = await analyticsAPI.getChatAnalytics(chatId, {
        include_message_breakdown: includeMessageBreakdown,
      })
      return response.data
    } catch (err: any) {
      console.error("Failed to fetch chat analytics:", err)
      return null
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchDashboardData(),
        fetchUsageData({ period_days: 30, include_daily_breakdown: true, include_agent_breakdown: true }),
      ])
      setIsLoading(false)
    }

    loadInitialData()
  }, [])

  return {
    dashboardData,
    usageData,
    isLoading,
    error,
    fetchDashboardData,
    fetchUsageData,
    fetchRealTimeUsage,
    fetchChatAnalytics,
  }
}
