"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import ProtectedRoute from "@/components/ProtectedRoute"
import ChatList from "@/components/chat/ChatList"
import ChatWindow from "@/components/chat/ChatWindow"
import AgentSelector from "@/components/chat/AgentSelector"
import { chatAPI, agentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { MessageSquare, Bot, ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"

interface Chat {
  id: string
  title: string
  agent_id?: string
  agent_name?: string
  created_at: string
  last_message_at: string
  message_count: number
  total_tokens: number
  total_cost: number
  status: string
}

interface Agent {
  _id: string
  name: string
  icon_name?: string
  instructions?: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.chatID as string

  const [chats, setChats] = useState<Chat[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "general" | "agents">("all")
  const [chatListCollapsed, setChatListCollapsed] = useState(false)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) {
      setChatListCollapsed(true)
    }
  }, [isMobile])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Fetching initial data for dashboard...")

      const [chatsResponse, agentsResponse] = await Promise.all([chatAPI.getAll({ limit: 50 }), agentAPI.getAll()])

      console.log("[v0] Chats response:", chatsResponse)
      console.log("[v0] Agents response:", agentsResponse)

      const chatsData = Array.isArray(chatsResponse?.data) ? chatsResponse.data : []
      const agentsData = Array.isArray(agentsResponse?.data) ? agentsResponse.data : []

      const filteredChats = chatsData
        .filter((chat: any) => chat && chat.id)
        .map((chat: any) => ({
          id: chat.id,
          title: chat.title || "Untitled Chat",
          agent_id: chat.agent_id,
          agent_name: chat.agent_name,
          created_at: chat.created_at || new Date().toISOString(),
          last_message_at: chat.last_message_at || new Date().toISOString(),
          message_count: chat.message_count || 0,
          total_tokens: chat.total_tokens || 0,
          total_cost: chat.total_cost || 0,
          status: chat.status || "active",
        }))

      console.log("[v0] Filtered chats:", filteredChats)
      setChats(filteredChats)
      setAgents(agentsData)
    } catch (error) {
      console.error("[v0] Error fetching initial data:", error)
      toast.error("Failed to load data")
      setChats([])
      setAgents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateGeneralChat = async () => {
    if (isCreatingChat) return

    try {
      setIsCreatingChat(true)
      const response = await chatAPI.create({
        title: "New General Chat",
      })

      if (response?.data?.id) {
        const newChat: Chat = {
          id: response.data.id,
          title: response.data.title || "New General Chat",
          created_at: response.data.created_at || new Date().toISOString(),
          last_message_at: response.data.last_message_at || new Date().toISOString(),
          message_count: response.data.message_count || 0,
          total_tokens: response.data.total_tokens || 0,
          total_cost: response.data.total_cost || 0,
          status: response.data.status || "active",
        }

        router.push(`/dashboard/${newChat.id}`)
        setChats((prev) => [newChat, ...prev])
        toast.success("New chat created!")

        if (isMobile) {
          setChatListCollapsed(true)
        }
      }
    } catch (error) {
      console.error("Error creating general chat:", error)
      toast.error("Failed to create chat")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleCreateAgentChat = async (agentId: string) => {
    if (isCreatingChat) return

    try {
      setIsCreatingChat(true)
      const selectedAgent = agents.find((agent) => agent._id === agentId)
      const response = await chatAPI.create({
        agent_id: agentId,
        title: `Chat with ${selectedAgent?.name || "Agent"}`,
      })

      if (response?.data?.id) {
        const newChat: Chat = {
          id: response.data.id,
          title: response.data.title || `Chat with ${selectedAgent?.name || "Agent"}`,
          agent_id: agentId,
          agent_name: selectedAgent?.name,
          created_at: response.data.created_at || new Date().toISOString(),
          last_message_at: response.data.last_message_at || new Date().toISOString(),
          message_count: response.data.message_count || 0,
          total_tokens: response.data.total_tokens || 0,
          total_cost: response.data.total_cost || 0,
          status: response.data.status || "active",
        }

        router.push(`/dashboard/${newChat.id}`)
        setShowAgentSelector(false)
        setChats((prev) => [newChat, ...prev])
        toast.success(`Chat with ${selectedAgent?.name} created!`)

        if (isMobile) {
          setChatListCollapsed(true)
        }
      }
    } catch (error) {
      console.error("Error creating agent chat:", error)
      toast.error("Failed to create agent chat")
    } finally {
      setIsCreatingChat(false)
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await chatAPI.delete(chatId)
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
      if (chatId === params.chatID) {
        router.push("/dashboard")
      }
      toast.success("Chat deleted")
    } catch (error) {
      console.error("Error deleting chat:", error)
      toast.error("Failed to delete chat")
    }
  }

  const handleUpdateChatTitle = async (chatId: string, title: string) => {
    try {
      await chatAPI.updateTitle(chatId, title)
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)))
      toast.success("Chat title updated")
    } catch (error) {
      console.error("Error updating chat title:", error)
      toast.error("Failed to update chat title")
    }
  }

  const handleChatUpdate = useCallback((updatedChat: any) => {
    if (!updatedChat || !updatedChat.id) {
      console.warn("Invalid chat update data:", updatedChat)
      return
    }

    setChats((prev) => {
      const existingIndex = prev.findIndex((chat) => chat && chat.id === updatedChat.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], ...updatedChat }
        return updated
      } else {
        const newChat: Chat = {
          id: updatedChat.id,
          title: updatedChat.title || "Untitled Chat",
          agent_id: updatedChat.agent_id,
          agent_name: updatedChat.agent_name,
          created_at: updatedChat.created_at || new Date().toISOString(),
          last_message_at: updatedChat.last_message_at || new Date().toISOString(),
          message_count: updatedChat.message_count || 0,
          total_tokens: updatedChat.total_tokens || 0,
          total_cost: updatedChat.total_cost || 0,
          status: updatedChat.status || "active",
        }
        return [newChat, ...prev]
      }
    })
  }, [])

  const handleChatSelect = (selectedChatId: string) => {
    router.push(`/dashboard/${selectedChatId}`)
  }

  const filteredChats = chats.filter((chat) => {
    if (activeTab === "general") return !chat.agent_id
    if (activeTab === "agents") return !!chat.agent_id
    return true
  })

  const selectedChat = chats.find((chat) => chat.id === chatId)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen my-auto bg-gray-50">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 relative">
          {/* Back button and Chat List Toggle */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="bg-white shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button> */}
            {/* <Button
              variant="outline"
              size="sm"
              className="bg-white shadow-sm"
              onClick={() => setChatListCollapsed(!chatListCollapsed)}
            >
              {chatListCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button> */}
          </div>

          {selectedChat ? (
            <ChatWindow chat={selectedChat} onChatUpdate={handleChatUpdate} />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50 p-4">
              <div className="text-center max-w-md mx-auto">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Not Found</h3>
                <p className="text-gray-500 mb-6">The requested chat could not be found or may be loading.</p>
                <div className="flex flex-col gap-2">
                  <Button onClick={() => router.push("/dashboard")} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button onClick={fetchInitialData} variant="ghost" size="sm">
                    Retry Loading
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${
            chatListCollapsed ? "w-0 overflow-hidden" : "w-full sm:w-80 lg:w-96 xl:w-80"
          } ${isMobile ? "absolute right-0 top-0 h-full z-30 shadow-xl" : ""}`}
        >
          {!chatListCollapsed && (
            <>
              {isMobile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setChatListCollapsed(true)} />
              )}

              <div className="relative z-30 bg-white h-full flex flex-col">
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Chats</h2>
                    <div className="flex gap-1 sm:gap-2">
                      {isMobile && (
                        <Button variant="ghost" size="sm" onClick={() => setChatListCollapsed(true)} className="p-1.5">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        onClick={handleCreateGeneralChat}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                        disabled={isCreatingChat}
                      >
                        <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">General</span>
                      </Button>
                      <Button
                        onClick={() => setShowAgentSelector(true)}
                        size="sm"
                        className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                        disabled={agents.length === 0 || isCreatingChat}
                      >
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Agent</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        activeTab === "all" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      All ({chats.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        activeTab === "general" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      General ({chats.filter((c) => !c.agent_id).length})
                    </button>
                    <button
                      onClick={() => setActiveTab("agents")}
                      className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                        activeTab === "agents" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Agents ({chats.filter((c) => !!c.agent_id).length})
                    </button>
                  </div>
                </div>

                <ChatList
                  chats={filteredChats}
                  selectedChatId={chatId}
                  onSelectChat={handleChatSelect}
                  onDeleteChat={handleDeleteChat}
                  onUpdateTitle={handleUpdateChatTitle}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {showAgentSelector && (
        <AgentSelector
          agents={agents}
          onSelectAgent={handleCreateAgentChat}
          onClose={() => setShowAgentSelector(false)}
        />
      )}
    </ProtectedRoute>
  )
}
