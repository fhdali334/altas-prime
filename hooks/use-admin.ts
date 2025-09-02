"use client"

import { useState, useEffect } from "react"
import { adminAPI } from "@/lib/api"

export interface AdminUser {
  id: string
  email: string
  username: string
  role: string
  is_verified: boolean
  created_at: string
  last_login: string
  total_tokens_used: number
  total_cost: number
  total_chats: number
}

export interface SystemAnalytics {
  system_analytics: {
    period_start: string
    period_end: string
    total_users: number
    active_users: number
    total_tokens_consumed: number
    total_cost: number
    total_chats: number
    total_messages: number
    agent_stats: Array<{
      agent_id: string
      agent_name: string
      tokens: number
      cost: number
      messages: number
      avg_processing_time: number
    }>
    daily_platform_usage: Array<{
      date: string
      tokens: number
      cost: number
      messages: number
      active_users: number
    }>
    cost_per_user_avg: number
    most_expensive_users: Array<{
      user_id: string
      email: string
      total_cost: number
      total_tokens: number
    }>
    cost_optimization_suggestions: string[]
    avg_processing_time: number
  }
  top_users: AdminUser[]
  performance_metrics: {
    database_size: string
    avg_response_time: number
    error_rate: number
    uptime_percentage: number
  }
}

export const useAdmin = () => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null)
  const [systemStats, setSystemStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data.users)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users")
    }
  }

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await adminAPI.getUserById(userId)
      return response.data
    } catch (err: any) {
      console.error("Failed to fetch user details:", err)
      return null
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await adminAPI.deleteUser(userId, { confirm: true })
      await fetchUsers() // Refresh users list
      return response.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to delete user")
    }
  }

  const fetchSystemAnalytics = async (periodDays = 30) => {
    try {
      const response = await adminAPI.getAnalytics({ period_days: periodDays })
      setSystemAnalytics(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch system analytics")
    }
  }

  const fetchSystemStats = async () => {
    try {
      const response = await adminAPI.getSystemStatistics()
      setSystemStats(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch system statistics")
    }
  }

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      await Promise.all([fetchUsers(), fetchSystemAnalytics(), fetchSystemStats()])
      setIsLoading(false)
    }

    loadInitialData()
  }, [])

  return {
    users,
    systemAnalytics,
    systemStats,
    isLoading,
    error,
    fetchUsers,
    fetchUserDetails,
    deleteUser,
    fetchSystemAnalytics,
    fetchSystemStats,
  }
}
