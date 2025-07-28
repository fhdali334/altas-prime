"use client"

import { useState, useEffect, useCallback } from "react"
import ProtectedRoute from "@/components/ProtectedRoute"
import Sidebar from "@/components/layout/Sidebar"
import ChatList from "@/components/chat/ChatList"
import ChatWindow from "@/components/chat/ChatWindow"
import AgentSelector from "@/components/chat/AgentSelector"
import { chatAPI, agentAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { MessageSquare, Bot, Menu, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

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

export default function DashboardPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "general" | "agents">("all")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chatListCollapsed, setChatListCollapsed] = useState(false)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setIsLoading(true)
      const [chatsResponse, agentsResponse] = await Promise.all([chatAPI.getAll({ limit: 50 }), agentAPI.getAll()])

      // Ensure we have valid data arrays
      const chatsData = Array.isArray(chatsResponse?.data) ? chatsResponse.data : []
      const agentsData = Array.isArray(agentsResponse?.data) ? agentsResponse.data : []

      // Filter out chats with 0 messages and ensure all required properties exist
      const filteredChats = chatsData
        .filter((chat: any) => chat && chat.id && typeof chat.message_count === "number" && chat.message_count > 0)
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

      setChats(filteredChats)
      setAgents(agentsData)
    } catch (error) {
      console.error("Error fetching initial data:", error)
      toast.error("Failed to load data")
      // Set empty arrays on error to prevent undefined issues
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

        setSelectedChatId(newChat.id)
        // Add to chats list immediately
        setChats((prev) => [newChat, ...prev])
        toast.success("New chat created!")
      } else {
        throw new Error("Invalid response from server")
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

        setSelectedChatId(newChat.id)
        setShowAgentSelector(false)
        // Add to chats list immediately
        setChats((prev) => [newChat, ...prev])
        toast.success(`Chat with ${selectedAgent?.name} created!`)
      } else {
        throw new Error("Invalid response from server")
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
      if (selectedChatId === chatId) {
        setSelectedChatId(null)
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

  // Use useCallback to prevent unnecessary re-renders
  const handleChatUpdate = useCallback((updatedChat: any) => {
    // Validate updatedChat object
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
      } else if (updatedChat.message_count > 0) {
        // Add new chat to list only if it has messages
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
      return prev
    })
  }, [])

  const filteredChats = chats.filter((chat) => {
    if (activeTab === "general") return !chat.agent_id
    if (activeTab === "agents") return !!chat.agent_id
    return true
  })

  const selectedChat = chats.find((chat) => chat.id === selectedChatId)

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-gray-50">
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
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        <div className={`flex-1 flex transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "ml-0 lg:ml-64"}`}>
          {/* Main Chat Area */}
          <div className="flex-1 relative">
            {/* Chat List Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white shadow-sm"
              onClick={() => setChatListCollapsed(!chatListCollapsed)}
            >
              {chatListCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>

            {selectedChat ? (
              <ChatWindow chat={selectedChat} onChatUpdate={handleChatUpdate} />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Atlas Prime</h3>
                  <p className="text-gray-500 mb-6">
                    Start a conversation with our AI or choose from your existing chats
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleCreateGeneralChat}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                      disabled={isCreatingChat}
                    >
                      <MessageSquare className="w-4 h-4" />
                      {isCreatingChat ? "Creating..." : "New General Chat"}
                    </Button>
                    <Button
                      onClick={() => setShowAgentSelector(true)}
                      className="flex items-center gap-2"
                      disabled={agents.length === 0 || isCreatingChat}
                    >
                      <Bot className="w-4 h-4" />
                      Chat with Agent
                    </Button>
                  </div>
                  {agents.length === 0 && (
                    <p className="text-sm text-gray-400 mt-2">No agents available. Create an agent first.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat List Sidebar - Right Side */}
          <div
            className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${
              chatListCollapsed ? "w-0 overflow-hidden" : "w-80"
            }`}
          >
            {!chatListCollapsed && (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateGeneralChat}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 bg-transparent"
                        disabled={isCreatingChat}
                      >
                        <MessageSquare className="w-4 h-4" />
                        General
                      </Button>
                      <Button
                        onClick={() => setShowAgentSelector(true)}
                        size="sm"
                        className="flex items-center gap-1"
                        disabled={agents.length === 0 || isCreatingChat}
                      >
                        <Bot className="w-4 h-4" />
                        Agent
                      </Button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "all" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      All ({chats.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "general" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      General ({chats.filter((c) => !c.agent_id).length})
                    </button>
                    <button
                      onClick={() => setActiveTab("agents")}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "agents" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Agents ({chats.filter((c) => !!c.agent_id).length})
                    </button>
                  </div>
                </div>

                {/* Chat List */}
                <ChatList
                  chats={filteredChats}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  onDeleteChat={handleDeleteChat}
                  onUpdateTitle={handleUpdateChatTitle}
                />
              </>
            )}
          </div>
        </div>

        {/* Agent Selector Modal */}
        {showAgentSelector && (
          <AgentSelector
            agents={agents}
            onSelectAgent={handleCreateAgentChat}
            onClose={() => setShowAgentSelector(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
