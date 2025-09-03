"use client"

import { useState } from "react"
import AdminRoute from "@/components/AdminRoute"
import { useAdmin } from "@/hooks/use-admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import UserDetailsModal from "@/components/admin/UserDetailsModal"
import {
  Users,
  Activity,
  DollarSign,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const { users, systemAnalytics, systemStats, isLoading, error, fetchUsers, deleteUser, fetchUserDetails } = useAdmin()
  const { toast } = useToast()

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      await deleteUser(userId)
      toast({
        title: "User Deleted",
        description: `User ${userEmail} has been successfully deleted.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId)
    setIsUserModalOpen(true)
  }

  const handleRefresh = () => {
    fetchUsers()
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users, monitor system performance, and view analytics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="w-full sm:w-auto mt-4 sm:mt-0 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* System Overview Cards */}
        {systemStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.collections.users}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.user_roles.admins} admins • {systemStats.user_roles.users} users
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">+{systemStats.recent_activity.new_users} this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.chat_statistics.active_chats}</div>
                <p className="text-xs text-muted-foreground">{systemStats.collections.messages} total messages</p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">+{systemStats.recent_activity.new_chats} new chats</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.token_usage_totals.total_tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${systemStats.token_usage_totals.total_cost.toFixed(2)} total cost
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600">
                    {systemStats.recent_activity.messages_sent} messages today
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.chat_statistics.token_limit_exceeded} limit exceeded
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600">{systemStats.collections.alerts} active alerts</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* System Analytics Charts */}
        {systemAnalytics && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Daily Platform Usage</CardTitle>
                <CardDescription>Token consumption across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={systemAnalytics.system_analytics.daily_platform_usage}>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Top Users by Cost</CardTitle>
                <CardDescription>Highest spending users</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={systemAnalytics.system_analytics.most_expensive_users}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="email" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(4)}`, "Cost"]} />
                    <Bar dataKey="total_cost" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">User Management</CardTitle>
            <CardDescription>Manage system users and their access</CardDescription>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found matching your search.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 sm:gap-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm sm:text-base">{user.username}</h4>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {user.role}
                        </Badge>
                        {!user.is_verified && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                        <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>
                        <span>{user.total_chats} chats</span>
                        <span>{user.total_tokens_used.toLocaleString()} tokens</span>
                        <span>${user.total_cost.toFixed(4)} spent</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewUser(user.id)}>
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      {user.role !== "admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500 mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="mx-4">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete user "{user.email}"? This action cannot be undone and
                                will delete all associated data including chats, messages, and files.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cost Optimization Suggestions */}
        {systemAnalytics?.system_analytics.cost_optimization_suggestions && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cost Optimization Suggestions</CardTitle>
              <CardDescription>Recommendations to reduce system costs and improve efficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {systemAnalytics.system_analytics.cost_optimization_suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Details Modal */}
        <UserDetailsModal
          userId={selectedUserId}
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false)
            setSelectedUserId(null)
          }}
        />
      </div>
    </AdminRoute>
  )
}
