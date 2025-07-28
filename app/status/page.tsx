"use client"

import { useState, useEffect } from "react"
import { statusAPI } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Server, Database, Zap, RefreshCw, Download } from "lucide-react"

interface SystemStatus {
  status: "healthy" | "warning" | "error"
  uptime: string
  version: string
  database_status: "connected" | "disconnected"
  active_sessions: number
  total_agents: number
  total_messages: number
}

interface LogEntry {
  id: string
  timestamp: string
  level: "INFO" | "WARNING" | "ERROR"
  message: string
  source: string
}

export default function StatusPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await statusAPI.get()
      setStatus(response.data)
    } catch (err) {
      setError("Failed to fetch system status")
      console.error("Error fetching status:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      setLogsLoading(true)
      const response = await statusAPI.getLogs()
      setLogs(response.data)
    } catch (err) {
      console.error("Error fetching logs:", err)
    } finally {
      setLogsLoading(false)
    }
  }

  const exportLogs = async () => {
    try {
      const response = await statusAPI.exportLogs()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `system-logs-${new Date().toISOString().split("T")[0]}.txt`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting logs:", error)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchLogs()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStatus()
      fetchLogs()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-blue-100 text-blue-800"
      case "WARNING":
        return "bg-yellow-100 text-yellow-800"
      case "ERROR":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">System Status & Logs</h1>
          <div className="flex gap-2">
            <Button onClick={exportLogs} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export Logs
            </Button>
            <Button
              onClick={() => {
                fetchStatus()
                fetchLogs()
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <>
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(status?.status || "unknown")}>{status?.status || "Unknown"}</Badge>
                  <p className="text-xs text-muted-foreground mt-2">Uptime: {status?.uptime || "N/A"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <Badge className={getStatusColor(status?.database_status === "connected" ? "healthy" : "error")}>
                    {status?.database_status || "Unknown"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">Version: {status?.version || "N/A"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status?.active_sessions || 0}</div>
                  <p className="text-xs text-muted-foreground">Current active users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status?.total_agents || 0}</div>
                  <p className="text-xs text-muted-foreground">{status?.total_messages || 0} total messages</p>
                </CardContent>
              </Card>
            </div>

            {/* Activity Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No logs available</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Badge className={getLogLevelColor(log.level)} variant="secondary">
                          {log.level}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{log.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{log.source}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
