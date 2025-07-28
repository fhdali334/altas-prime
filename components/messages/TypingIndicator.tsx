"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from "lucide-react"

export default function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <Avatar className="w-8 h-8 bg-blue-100">
        <AvatarFallback>
          <Bot className="w-4 h-4 text-blue-600" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-xs">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}
