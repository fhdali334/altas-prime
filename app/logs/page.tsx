"use client"

import { useState, useEffect } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, Download, Filter, RefreshCw, Search, User, MessageSquare, Bot, Upload, Settings } from "lucide-react"
import { logsAPI, monitoringAPI } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

interface LogEntry {
  id: string
  user_id: string
  action: string
  timestamp: string
  details: any
  ip_address?: string
  user_agent?: string
}

interface LogsSummary {
  daily_activity: Array<{
    _id: string
    count: number
  }>
  recent_activities: Array<{
    _id: string
    action: string
    timestamp: string
    details: any
  }>
  total_activities: number
}

const actionIcons: Record<string, any> = {
  user_login: User,
  user_logout: User,
  user_registration: User,
  email_verification: User,
  chat_message_sent: MessageSquare,
  agent_message_sent: Bot,
  agent_created: Bot,
  agent_updated: Bot,
  agent_deleted: Bot,
  file_uploaded: Upload,
  settings_updated: Settings,
  password_reset_request: User,
  password_reset_completed: User,
  logs_exported: Download,
  tools_accessed: Settings,
}

const actionColors: Record<string, string> = {
  user_login: "bg-green-100 text-green-800",
  user_logout: "bg-gray-100 text-gray-800",
  user_registration: "bg-blue-100 text-blue-800",
  email_verification: "bg-purple-100 text-purple-800",
  chat_message_sent: "bg-blue-100 text-blue-800",
  agent_message_sent: "bg-indigo-100 text-indigo-800",
  agent_created: "bg-green-100 text-green-800",
  agent_updated: "bg-yellow-100 text-yellow-800",
  agent_deleted: "bg-red-100 text-red-800",
  file_uploaded: "bg-orange-100 text-orange-800",
  settings_updated: "bg-gray-100 text-gray-800",
  password_reset_request: "bg-yellow-100 text-yellow-800",
  password_reset_completed: "bg-green-100 text-green-800",
  logs_exported: "bg-blue-100 text-blue-800",
  tools_accessed: "bg-purple-100 text-purple-800",
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [summary, setSummary] = useState<LogsSummary | null>(null)
  const [actions, setActions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [selectedAction, startDate, endDate, currentPage])

  const fetchInitialData = async () => {
    try {
      setIsLoading(true)
      const [actionsResponse, summaryResponse] = await Promise.all([logsAPI.getActions(), logsAPI.getSummary()])
      setActions(actionsResponse.data)
      setSummary(summaryResponse.data)
    } catch (error) {
      console.error("Failed to fetch initial data:", error)
      toast.error("Failed to load logs data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const params: any = {
        limit: 50,
      }

      if (selectedAction !== "all") {
        params.action = selectedAction
      }

      if (startDate) {
        params.start_date = startDate
      }

      if (endDate) {
        params.end_date = endDate
      }

      const response = await logsAPI.getLogs(params)
      setLogs(response.data.logs || [])
      setTotalLogs(response.data.total_logs || 0)
    } catch (error) {
      console.error("Failed to fetch logs:", error)
      toast.error("Failed to load logs")
    }
  }

  const handleExportLogs = async () => {
    try {
      const params: any = {}
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const response = await monitoringAPI.exportLogs(params)

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `logs-${format(new Date(), "yyyy-MM-dd")}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Logs exported successfully")
    } catch (error) {
      console.error("Failed to export logs:", error)
      toast.error("Failed to export logs")
    }
  }

  const handleRefresh = () => {
    fetchLogs()
    fetchInitialData()
  }

  const filteredLogs = logs.filter(
    (log) =>
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatLogDetails = (action: string, details: any) => {
    switch (action) {
      case "user_login":
      case "user_logout":
        return details?.email || "Unknown user"
      case "chat_message_sent":
      case "agent_message_sent":
        return `${details?.content_length || 0} chars, ${details?.total_tokens || 0} tokens, $${details?.total_cost?.toFixed(4) || "0.0000"}`
      case "agent_created":
      case "agent_updated":
        return details?.agent_name || "Unknown agent"
      case "file_uploaded":
        return `${details?.filename || "Unknown file"} (${details?.file_size || 0} bytes)`
      case "user_registration":
        return details?.deleted_user_email || details?.email || "New user"
      default:
        return JSON.stringify(details).substring(0, 100) + "..."
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Activity Logs</h1>
            <p className="text-gray-600">Monitor system activity and user actions</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Action Type</label>
                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        {actions?.actions?.map((action: string) => (
                          <SelectItem key={action} value={action}>
                            {actions.descriptions[action] || action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Activity Logs ({totalLogs} total, {filteredLogs.length} shown)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const IconComponent = actionIcons[log.action] || Activity
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <IconComponent className="w-4 h-4" />
                                <Badge className={actionColors[log.action] || "bg-gray-100 text-gray-800"}>
                                  {actions?.descriptions?.[log.action] || log.action}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {format(new Date(log.timestamp), "MMM dd, yyyy")}
                                <div className="text-xs text-gray-500">
                                  {format(new Date(log.timestamp), "HH:mm:ss")}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm max-w-xs truncate">
                                {formatLogDetails(log.action, log.details)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{log.ip_address || "N/A"}</span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            {summary && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{summary.total_activities}</div>
                      <p className="text-sm text-gray-600">All time</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{summary.recent_activities.length}</div>
                      <p className="text-sm text-gray-600">Last 24 hours</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Daily Average</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {summary.daily_activity.length > 0
                          ? Math.round(
                              summary.daily_activity.reduce((sum, day) => sum + day.count, 0) /
                                summary.daily_activity.length,
                            )
                          : 0}
                      </div>
                      <p className="text-sm text-gray-600">Activities per day</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activities */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activities</CardTitle>
                    <CardDescription>Latest system activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.recent_activities.slice(0, 10).map((activity) => {
                        const IconComponent = actionIcons[activity.action] || Activity
                        return (
                          <div key={activity._id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge className={actionColors[activity.action] || "bg-gray-100 text-gray-800"}>
                                  {actions?.descriptions?.[activity.action] || activity.action}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {format(new Date(activity.timestamp), "MMM dd, HH:mm")}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatLogDetails(activity.action, activity.details)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
