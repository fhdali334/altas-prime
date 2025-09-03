"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import AdminRoute from "@/components/AdminRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Server,
  Database,
  Zap,
  Mail,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { monitoringAPI, adminAPI } from "@/lib/api"
import { toast } from "sonner"

interface SystemStatus {
  status: string
  timestamp: string
  version: string
  services: {
    database: string
    openai: string
    email: string
    authentication: string
  }
  uptime: number | null
}

interface SystemStats {
  collections: {
    users: number
    chats: number
    messages: number
    agents: number
    tools: number
    files: number
    token_usage_records: number
    daily_usage_records: number
    alerts: number
  }
  user_roles: {
    admins: number
    users: number
  }
  chat_statistics: {
    active_chats: number
    token_limit_exceeded: number
    archived_chats: number
  }
  recent_activity: {
    new_users: number
    new_chats: number
    messages_sent: number
    files_uploaded: number
  }
  token_usage_totals: {
    total_tokens: number
    total_cost: number
    total_input_tokens: number
    total_output_tokens: number
  }
}

const serviceIcons: Record<string, any> = {
  database: Database,
  openai: Zap,
  email: Mail,
  authentication: Shield,
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "connected":
    case "active":
    case "configured":
      return "text-green-600 bg-green-100"
    case "not_configured":
    case "inactive":
      return "text-yellow-600 bg-yellow-100"
    case "error":
    case "failed":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "connected":
    case "active":
    case "configured":
      return CheckCircle
    case "not_configured":
    case "inactive":
      return AlertTriangle
    case "error":
    case "failed":
      return XCircle
    default:
      return Clock
  }
}

export default function MonitoringPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchSystemData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSystemData = async () => {
    try {
      setIsLoading(true)
      const [statusResponse, statsResponse] = await Promise.all([
        monitoringAPI.getStatus(),
        adminAPI.getSystemStatistics(),
      ])
      setSystemStatus(statusResponse.data)
      setSystemStats(statsResponse.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch system data:", error)
      toast.error("Failed to load system monitoring data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchSystemData()
  }

  if (isLoading && !systemStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">System Monitoring</h1>
              <p className="text-gray-600">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* System Status Overview */}
          {systemStatus && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    System Status
                  </CardTitle>
                  <Badge
                    className={systemStatus.status === "OK" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {systemStatus.status}
                  </Badge>
                </div>
                <CardDescription>
                  Version {systemStatus.version} • {new Date(systemStatus.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(systemStatus.services).map(([service, status]) => {
                    const IconComponent = serviceIcons[service] || Server
                    const StatusIcon = getStatusIcon(status)
                    return (
                      <div key={service} className="flex items-center gap-3 p-3 border rounded-lg">
                        <IconComponent className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-medium capitalize">{service}</p>
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4" />
                            <Badge className={getStatusColor(status)}>{status.replace("_", " ")}</Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Statistics */}
          {systemStats && (
            <>
              {/* Database Collections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Collections</CardTitle>
                    <CardDescription>Current data storage statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(systemStats.collections).map(([collection, count]) => (
                        <div key={collection} className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{collection.replace("_", " ")}</span>
                          <Badge variant="outline">{count.toLocaleString()}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Statistics</CardTitle>
                    <CardDescription>User roles and chat activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">User Roles</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Administrators</span>
                            <Badge className="bg-blue-100 text-blue-800">{systemStats.user_roles.admins}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Regular Users</span>
                            <Badge variant="outline">{systemStats.user_roles.users}</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Chat Statistics</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Active Chats</span>
                            <Badge className="bg-green-100 text-green-800">
                              {systemStats.chat_statistics.active_chats}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Token Limit Exceeded</span>
                            <Badge className="bg-red-100 text-red-800">
                              {systemStats.chat_statistics.token_limit_exceeded}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Token Usage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <CardDescription>Activity in the last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">New Users</span>
                        </div>
                        <span className="text-lg font-bold text-blue-700">{systemStats.recent_activity.new_users}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">New Chats</span>
                        </div>
                        <span className="text-lg font-bold text-green-700">
                          {systemStats.recent_activity.new_chats}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Messages Sent</span>
                        </div>
                        <span className="text-lg font-bold text-purple-700">
                          {systemStats.recent_activity.messages_sent}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium">Files Uploaded</span>
                        </div>
                        <span className="text-lg font-bold text-orange-700">
                          {systemStats.recent_activity.files_uploaded}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Token Usage Totals</CardTitle>
                    <CardDescription>Overall platform usage statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Total Tokens</span>
                          <span className="text-lg font-bold">
                            {systemStats.token_usage_totals.total_tokens.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={
                            (systemStats.token_usage_totals.total_output_tokens /
                              systemStats.token_usage_totals.total_tokens) *
                            100
                          }
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Input: {systemStats.token_usage_totals.total_input_tokens.toLocaleString()}</span>
                          <span>Output: {systemStats.token_usage_totals.total_output_tokens.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Total Cost</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${systemStats.token_usage_totals.total_cost.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Average: $
                          {(
                            (systemStats.token_usage_totals.total_cost / systemStats.token_usage_totals.total_tokens) *
                            1000
                          ).toFixed(4)}{" "}
                          per 1K tokens
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </AdminRoute>
    </ProtectedRoute>
  )
}
