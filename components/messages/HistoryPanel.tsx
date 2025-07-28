"use client"

import { useState } from "react"
import { Clock, ChevronRight, ChevronDown } from "lucide-react"

interface PromptHistory {
  content: string
  agent_id: string
}

interface HistoryPanelProps {
  messages: PromptHistory[]
  onSelectPrompt: (message: { content: string; agent_id: string }) => void
}

export default function HistoryPanel({ messages, onSelectPrompt }: HistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-gray-900">Recent Prompts</h3>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No recent prompts</div>
          ) : (
            <div className="p-2 space-y-1">
              {messages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => onSelectPrompt(message)}
                  className="w-full text-left p-3 rounded-md hover:bg-white hover:shadow-sm transition-all text-sm border border-transparent hover:border-gray-200"
                >
                  <p className="text-gray-900 line-clamp-2 leading-relaxed">{message.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
