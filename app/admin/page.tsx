"use client"

import { useState } from "react"
import AdminRoute from "@/components/AdminRoute"
import Sidebar from "@/components/layout/Sidebar"
import { useAdmin } from "@/hooks/use-admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Activity,
  DollarSign,
  MessageSquare,
  Menu,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  AlertTriangle,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
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

  const handleViewUser = async (userId: string) => {
    try {
      const userDetails = await fetchUserDetails(userId)
      if (userDetails) {
        // You could open a modal or navigate to a detailed view
        console.log("User details:", userDetails)
        toast({
          title: "User Details",
          description: "Check console for detailed user information.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user details.",
        variant: "destructive",
      })
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
    <AdminRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <div className="lg:hidden fixed top-4 left-4 z-30">
          <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "ml-0 lg:ml-64"}`}
        >
          <div className="p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 max-lg:ml-12">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Admin Dashboard</h1>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* System Overview Cards */}
              {systemStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemStats.collections.chats}</div>
                      <p className="text-xs text-muted-foreground">{systemStats.collections.messages} total messages</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {systemStats.token_usage_totals.total_tokens.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ${systemStats.token_usage_totals.total_cost.toFixed(2)} total cost
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{systemStats.recent_activity.new_chats}</div>
                      <p className="text-xs text-muted-foreground">
                        New chats • {systemStats.recent_activity.messages_sent} messages sent
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* System Analytics Charts */}
              {systemAnalytics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Platform Usage</CardTitle>
                      <CardDescription>Token consumption across the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={systemAnalytics.system_analytics.daily_platform_usage}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="tokens" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Users by Cost</CardTitle>
                      <CardDescription>Highest spending users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={systemAnalytics.system_analytics.most_expensive_users}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="email" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, "Cost"]} />
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
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage system users and their access</CardDescription>
                  <div className="flex gap-2 mt-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{user.username}</h4>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                            {!user.is_verified && (
                              <Badge variant="destructive">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(user.created_at).toLocaleDateString()} • Last login:{" "}
                            {new Date(user.last_login).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium">{user.total_tokens_used.toLocaleString()} tokens</p>
                          <p className="text-sm text-muted-foreground">${user.total_cost.toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground">{user.total_chats} chats</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewUser(user.id)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.role !== "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete user "{user.email}"? This action cannot be undone
                                    and will delete all associated data including chats, messages, and files.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost Optimization Suggestions */}
              {systemAnalytics?.system_analytics.cost_optimization_suggestions && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Cost Optimization Suggestions</CardTitle>
                    <CardDescription>Recommendations to reduce system costs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {systemAnalytics.system_analytics.cost_optimization_suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}
