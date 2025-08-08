"use client"

import { useState, useEffect, useRef } from "react"
import { chatAPI } from "@/lib/api"
import ReplyBox from "@/components/messages/ReplyBox"
import UserMessage from "@/components/messages/UserMessage"
import BotMessage from "@/components/messages/BotMessage"
import TypingIndicator from "@/components/messages/TypingIndicator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  file_ids?: string[]
}

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

interface ChatWindowProps {
  chat: Chat
  onChatUpdate: (updatedChat: Chat) => void
}

export default function ChatWindow({ chat, onChatUpdate }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (chat?.id) {
      fetchMessages()
    }
  }, [chat?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const fetchMessages = async () => {
    if (!chat?.id) return

    try {
      setIsLoading(true)
      const response = await chatAPI.getById(chat.id, { limit: 100 })

      if (response?.data?.messages && Array.isArray(response.data.messages)) {
        const validMessages = response.data.messages
          .filter((msg: any) => msg && msg.id && msg.content && msg.role)
          .map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            created_at: msg.created_at || new Date().toISOString(),
            file_ids: msg.file_ids || [],
          }))
          .sort((a:any, b:any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        setMessages(validMessages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error("Failed to load messages")
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (content: string, fileIds?: string[]) => {
    if (!chat?.id || !content.trim()) return

    const tempId = `temp-${Date.now()}`
    const userMessage: Message = {
      id: tempId,
      content: content.trim(),
      role: "user",
      created_at: new Date().toISOString(),
      file_ids: fileIds || [],
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    try {
      const response = await chatAPI.sendMessage(chat.id, {
        content: content.trim(),
        file_ids: fileIds,
        include_file_content: true,
        max_file_tokens: 4000,
      })

      console.log("API Response:", response.data) // Debug log

      if (response?.data) {
        // Update the temporary user message with real ID if provided
        if (response.data.user_message_id) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? { ...msg, id: response.data.user_message_id } : msg)),
          )
        }

        // Add bot response - check multiple possible response fields
        const botContent =
          response.data.content || response.data.response || response.data.message || response.data.reply

        if (botContent) {
          const botMessage: Message = {
            id: response.data.message_id || response.data.bot_message_id || `bot-${Date.now()}`,
            content: botContent,
            role: "assistant",
            created_at: response.data.created_at || new Date().toISOString(),
          }

          // Add bot message after a short delay for better UX
          setTimeout(() => {
            setMessages((prev) => [...prev, botMessage])
            setIsTyping(false)
          }, 500)
        } else {
          console.warn("No bot response content found in:", response.data)
          setIsTyping(false)
          toast.error("No response received from AI")
        }

        // Update chat details in parent component
        if (onChatUpdate) {
          const updatedChat: Chat = {
            ...chat,
            message_count: (chat.message_count || 0) + (botContent ? 2 : 1),
            last_message_at: new Date().toISOString(),
            total_tokens: response.data.total_tokens || chat.total_tokens || 0,
            total_cost: response.data.total_cost || chat.total_cost || 0,
            ...response.data.chat,
          }
          onChatUpdate(updatedChat)
        }
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setIsTyping(false)
      toast.error("Failed to send message")
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{chat.title}</h2>
            {chat.agent_name && <p className="text-xs sm:text-sm text-blue-600">with {chat.agent_name}</p>}
          </div>
          <div className="text-right text-xs text-gray-500 ml-4">
            <div>{chat.message_count} messages</div>
            {chat.total_tokens > 0 && !isMobile && <div>{chat.total_tokens.toLocaleString()} tokens</div>}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-2 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? <UserMessage message={message} /> : <BotMessage message={message} />}
              </div>
            ))
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Box */}
      <ReplyBox onSendMessage={handleSendMessage} disabled={isTyping} placeholder="Type your message..." />
    </div>
  )
}
