"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Copy, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  file_ids?: string[]
}

interface BotMessageProps {
  message: Message
}

export default function BotMessage({ message }: BotMessageProps) {
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return (
    <div className="flex justify-start">
      <div className={`flex items-start gap-2 sm:gap-3 ${isMobile ? 'max-w-[85%]' : 'max-w-[70%]'}`}>
        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
          <AvatarFallback className="bg-gray-100 text-gray-600">
            <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1">
          <div className="bg-gray-100 rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
            <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 px-2 text-xs hover:bg-gray-100"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  {!isMobile && "Copied"}
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  {!isMobile && "Copy"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
