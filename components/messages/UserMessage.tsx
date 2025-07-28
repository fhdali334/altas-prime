"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  file_ids?: string[]
}

interface UserMessageProps {
  message: Message
}

export default function UserMessage({ message }: UserMessageProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex items-start space-x-3 justify-end">
      <div className="flex flex-col items-end max-w-xs lg:max-w-md">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.file_ids && message.file_ids.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            📎 {message.file_ids.length} file{message.file_ids.length > 1 ? "s" : ""} attached
          </div>
        )}
        <span className="text-xs text-gray-500 mt-1">{formatTime(message.created_at)}</span>
      </div>
      <Avatar className="w-8 h-8 bg-blue-600">
        <AvatarFallback>
          <User className="w-4 h-4 text-white" />
        </AvatarFallback>
      </Avatar>
    </div>
  )
}
