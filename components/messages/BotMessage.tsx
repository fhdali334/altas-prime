"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success("Message copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy message")
    }
  }

  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <Avatar className="w-8 h-8 bg-blue-100">
        <AvatarFallback>
          <Bot className="w-4 h-4 text-blue-600" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col max-w-xs lg:max-w-md">
        <div className="bg-gray-100 rounded-lg px-4 py-3 relative group">
          <p className="text-sm whitespace-pre-wrap text-gray-800">{message.content}</p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
        <span className="text-xs text-gray-500 mt-1">{formatTime(message.created_at)}</span>
      </div>
    </div>
  )
}
