"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Mail,
  Calendar,
  Activity,
  MessageSquare,
  FileText,
  Clock,
  Shield,
  AlertTriangle,
  Bot,
  ExternalLink,
} from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

interface UserDetailsModalProps {
  userId: string | null
  isOpen: boolean
  onClose: () => void
}

interface UserDetails {
  user: {
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
  statistics: {
    total_files: number
    account_age_days: number
    is_active: boolean
  }
  recent_activity: {
    recent_chats: Array<{
      _id: string
      user_id: string
      agent_id?: string
      agent_name: string
      title: string
      created_at: string
      last_message_at: string
      message_count: number
      total_tokens: number
      total_cost: number
      status: string
      file_ids: string[]
      chat_type: string
    }>
    recent_files: Array<any>
  }
}

export default function UserDetailsModal({ userId, isOpen, onClose }: UserDetailsModalProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails()
    }
  }, [userId, isOpen])

  const fetchUserDetails = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const response = await adminAPI.getUserById(userId)
      setUserDetails(response.data)
    } catch (error) {
      console.error("Failed to fetch user details:", error)
      toast.error("Failed to load user details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatClick = (chatId: string) => {
    console.log("[v0] Admin modal navigating to chat:", chatId)
    if (!chatId || chatId.trim() === "") {
      console.error("[v0] Chat ID is undefined, null, or empty in admin modal")
      toast.error("Invalid chat ID")
      return
    }

    try {
      const cleanChatId = chatId.trim()
      console.log("[v0] Navigating to chat:", `/dashboard/${cleanChatId}`)
      window.location.href = `/dashboard/${cleanChatId}`
      onClose() // Close modal after navigation
    } catch (error) {
      console.error("[v0] Navigation error:", error)
      toast.error("Failed to navigate to chat")
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Details
          </DialogTitle>
          <DialogDescription>Comprehensive user information and activity</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : userDetails ? (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* User Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{userDetails.user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{userDetails.user.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <Badge variant={userDetails.user.role === "admin" ? "default" : "secondary"}>
                        {userDetails.user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Joined {format(new Date(userDetails.user.created_at), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        Last login {format(new Date(userDetails.user.last_login), "MMM dd, yyyy HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {userDetails.user.is_verified ? (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                      {userDetails.statistics.is_active && <Badge className="bg-blue-100 text-blue-800">Active</Badge>}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Tokens</span>
                      <span className="font-semibold">{userDetails.user.total_tokens_used.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Cost</span>
                      <span className="font-semibold">${userDetails.user.total_cost.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Chats</span>
                      <span className="font-semibold">{userDetails.user.total_chats}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Files Uploaded</span>
                      <span className="font-semibold">{userDetails.statistics.total_files}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Account Age</span>
                      <span className="font-semibold">{userDetails.statistics.account_age_days} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Cost/Chat</span>
                      <span className="font-semibold">
                        $
                        {userDetails.user.total_chats > 0
                          ? (userDetails.user.total_cost / userDetails.user.total_chats).toFixed(4)
                          : "0.0000"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="chats" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chats">Recent Chats</TabsTrigger>
                  <TabsTrigger value="files">Files & Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="chats" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Recent Chats ({userDetails.recent_activity.recent_chats.length})
                      </CardTitle>
                      <CardDescription>User's most recent chat activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userDetails.recent_activity.recent_chats.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No recent chats found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userDetails.recent_activity.recent_chats.map((chat) => (
                            <div
                              key={chat._id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{chat.title}</h4>
                                  {chat.agent_name !== "General Assistant" && (
                                    <Badge variant="outline" className="text-xs">
                                      <Bot className="w-3 h-3 mr-1" />
                                      {chat.agent_name}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                  <span>{chat.message_count} messages</span>
                                  <span>{chat.total_tokens.toLocaleString()} tokens</span>
                                  <span>${chat.total_cost.toFixed(4)}</span>
                                  <span>{format(new Date(chat.last_message_at), "MMM dd, HH:mm")}</span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleChatClick(chat._id)}
                                className="ml-3"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Open
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Files & Activity
                      </CardTitle>
                      <CardDescription>File uploads and other user activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {userDetails.recent_activity.recent_files.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No recent files found</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Total files uploaded: {userDetails.statistics.total_files}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {userDetails.recent_activity.recent_files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <div>
                                  <p className="font-medium text-sm">{file.name || "Unknown file"}</p>
                                  <p className="text-xs text-gray-500">
                                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "Unknown size"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {file.created_at ? format(new Date(file.created_at), "MMM dd") : "Unknown date"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Failed to load user details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
