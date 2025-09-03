"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, MessageSquare, DollarSign, RefreshCw, Eye, AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [realTimeData, setRealTimeData] = useState<any>(null)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const router = useRouter()

  const {
    dashboardData,
    usageData,
    isLoading,
    error,
    fetchUsageData,
    fetchDashboardData,
    fetchRealTimeUsage,
    fetchChatAnalytics,
  } = useAnalytics()

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (selectedChatId) {
      const pollRealTimeData = async () => {
        const data = await fetchRealTimeUsage(selectedChatId)
        if (data) {
          setRealTimeData(data)
        }
      }

      // Initial fetch
      pollRealTimeData()

      // Poll every 10 seconds
      interval = setInterval(pollRealTimeData, 10000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [selectedChatId, fetchRealTimeUsage])

  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period)
    await fetchUsageData({
      period_days: Number.parseInt(period),
      include_daily_breakdown: true,
      include_agent_breakdown: true,
    })
  }

  const handleRefresh = async () => {
    await Promise.all([
      fetchDashboardData(),
      fetchUsageData({
        period_days: Number.parseInt(selectedPeriod),
        include_daily_breakdown: true,
        include_agent_breakdown: true,
      }),
    ])
  }

  const handleChatClick = (chatId: string) => {
    router.push(`/dashboard/${chatId}`)
  }

  const handleViewChatAnalytics = async (chatId: string) => {
    setSelectedChatId(chatId)
    const analytics = await fetchChatAnalytics(chatId, true)
    console.log("Chat analytics:", analytics)
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Analytics Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="w-full sm:w-auto bg-transparent">
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="sm:inline hidden">Refresh</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Real-time Usage Monitor */}
        {realTimeData && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Real-time Usage Monitor
              </CardTitle>
              <CardDescription>Live usage data for selected chat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Tokens Used</p>
                  <p className="text-2xl font-bold">{realTimeData.tokens_used_this_message}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Cost This Message</p>
                  <p className="text-2xl font-bold">${realTimeData.cost_this_message?.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Chat Cost</p>
                  <p className="text-2xl font-bold">${realTimeData.total_chat_cost?.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Usage %</p>
                  <p className="text-2xl font-bold">{realTimeData.percentage_used?.toFixed(1)}%</p>
                  {realTimeData.warning_level !== "none" && (
                    <Badge variant="destructive" className="mt-1">
                      {realTimeData.warning_level}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Usage</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.today.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.today.messages} messages • ${dashboardData.today.cost.toFixed(4)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.last_7_days.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.last_7_days.messages} messages • ${dashboardData.last_7_days.cost.toFixed(4)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.last_30_days.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.last_30_days.messages} messages • ${dashboardData.last_30_days.cost.toFixed(4)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardData.current_month.cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.current_month.budget_percentage}% of budget used
                </p>
                {dashboardData.alerts.has_critical && (
                  <Badge variant="destructive" className="mt-2">
                    {dashboardData.alerts.active_count} alerts
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        {usageData && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {/* Daily Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Daily Token Usage</CardTitle>
                <CardDescription>Token consumption over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any) => [value.toLocaleString(), "Tokens"]}
                    />
                    <Line type="monotone" dataKey="tokens" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Agent Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Usage by Agent</CardTitle>
                <CardDescription>Token distribution across agents</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usageData.agent_usage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ agent_name, percent }) => `${agent_name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="tokens"
                    >
                      {usageData.agent_usage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value.toLocaleString(), "Tokens"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Daily Cost Analysis</CardTitle>
                <CardDescription>Cost breakdown over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any) => [`$${Number(value).toFixed(4)}`, "Cost"]}
                    />
                    <Bar dataKey="cost" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Usage Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Usage Summary</CardTitle>
                <CardDescription>Key metrics for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Tokens:</span>
                  <span className="text-sm">{usageData.total_tokens_used.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Cost:</span>
                  <span className="text-sm">${usageData.total_cost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Messages:</span>
                  <span className="text-sm">{usageData.total_messages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Avg Tokens/Message:</span>
                  <span className="text-sm">{usageData.avg_tokens_per_message.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Avg Cost/Message:</span>
                  <span className="text-sm">${usageData.avg_cost_per_message.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Files Processed:</span>
                  <span className="text-sm">{usageData.files_processed}</span>
                </div>
                {usageData.most_expensive_chat && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Most Expensive Chat:</p>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-medium">{usageData.most_expensive_chat.title}</p>
                      <p className="text-xs text-muted-foreground">${usageData.most_expensive_chat.cost.toFixed(4)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Chats */}
        {dashboardData?.recent_chats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Recent Chats</CardTitle>
              <CardDescription>Your most recent chat activity - click to open or view analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {dashboardData.recent_chats.map((chat) => (
                  <div
                    key={chat.chat_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handleChatClick(chat.chat_id)}>
                      <h4 className="font-medium text-sm sm:text-base hover:text-blue-600 transition-colors">
                        {chat.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{chat.agent_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(chat.last_activity).toLocaleDateString()} • {chat.message_count} messages
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">{chat.total_tokens.toLocaleString()} tokens</p>
                        <p className="text-sm text-muted-foreground">${chat.total_cost.toFixed(4)}</p>
                        {!chat.can_continue && (
                          <Badge variant="secondary" className="text-xs">
                            Limit Reached
                          </Badge>
                        )}
                      </div>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewChatAnalytics(chat.chat_id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span className="hidden sm:inline">Analytics</span>
                      </Button> */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  )
}
