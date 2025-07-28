"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { MoreVertical, Trash2, Edit3, MessageSquare, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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

export default function ChatList({ chats, selectedChatId, onSelectChat, onDeleteChat, onUpdateTitle }: ChatListProps) {
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const handleStartEdit = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveEdit = () => {
    if (editingChatId && editTitle.trim()) {
      onUpdateTitle(editingChatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  // Ensure chats is always an array
  const validChats = Array.isArray(chats) ? chats : []

  if (validChats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No chats with messages yet</p>
          <p className="text-xs text-gray-400 mt-1">Start a conversation to see it here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {validChats.map((chat) => {
        // Ensure chat object has required properties
        if (!chat || !chat.id) return null

        return (
          <div
            key={chat.id}
            className={`group p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChatId === chat.id ? "bg-blue-50 border-blue-200" : ""
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {chat.agent_id ? (
                    <Bot className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  )}
                  {editingChatId === chat.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit()
                        if (e.key === "Escape") handleCancelEdit()
                      }}
                      className="h-6 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="font-medium text-sm text-gray-900 truncate">{chat.title || "Untitled Chat"}</h3>
                  )}
                </div>

                {chat.agent_name && <p className="text-xs text-blue-600 mb-1">with {chat.agent_name}</p>}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {chat.message_count || 0} message{(chat.message_count || 0) !== 1 ? "s" : ""}
                  </span>
                  <span>
                    {chat.last_message_at
                      ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })
                      : "Just now"}
                  </span>
                </div>

                {((chat.total_tokens || 0) > 0 || (chat.total_cost || 0) > 0) && (
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span>{(chat.total_tokens || 0).toLocaleString()} tokens</span>
                    <span>${(chat.total_cost || 0).toFixed(4)}</span>
                  </div>
                )}
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartEdit(chat)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this chat? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteChat(chat.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
