"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreVertical, Edit2, Trash2, MessageSquare, Bot, Check, X } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"

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

interface ChatListProps {
  chats: Chat[]
  selectedChatId: string | null
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onUpdateTitle: (chatId: string, title: string) => void
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  onUpdateTitle,
}: ChatListProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleEditStart = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
  }

  const handleEditSave = () => {
    if (editingChatId && editTitle.trim()) {
      onUpdateTitle(editingChatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleEditCancel = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No chats yet</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 sm:p-4 space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group relative p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedChatId === chat.id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {chat.agent_id ? (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                  )}
                  {editingChatId === chat.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-6 text-xs sm:text-sm"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleEditSave()
                          if (e.key === "Escape") handleEditCancel()
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={handleEditSave} className="h-6 w-6 p-0">
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleEditCancel} className="h-6 w-6 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{chat.title}</h3>
                  )}
                </div>

                {chat.agent_name && (
                  <p className="text-xs text-blue-600 mb-1">with {chat.agent_name}</p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{chat.message_count} messages</span>
                  {!isMobile && chat.total_tokens > 0 && (
                    <>
                      <span>•</span>
                      <span>{chat.total_tokens.toLocaleString()} tokens</span>
                    </>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => handleEditStart(chat)} className="text-xs">
                    <Edit2 className="w-3 h-3 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteChat(chat.id)}
                    className="text-red-600 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
