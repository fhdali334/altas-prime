"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from 'lucide-react'
import { formatDistanceToNow } from "date-fns"

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex justify-end">
      <div className={`flex items-start gap-2 sm:gap-3 ${isMobile ? 'max-w-[85%]' : 'max-w-[70%]'}`}>
        <div className="flex flex-col items-end flex-1">
          <div className="bg-blue-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
          <AvatarFallback className="bg-blue-100 text-blue-600">
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
