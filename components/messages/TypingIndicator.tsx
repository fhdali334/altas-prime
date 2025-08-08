"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot } from 'lucide-react'

export default function TypingIndicator() {
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
    <div className="flex justify-start">
      <div className={`flex items-start gap-2 sm:gap-3 ${isMobile ? 'max-w-[85%]' : 'max-w-[70%]'}`}>
        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
          <AvatarFallback className="bg-gray-100 text-gray-600">
            <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="bg-gray-100 rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
