"use client"
import { Zap, DollarSign, MessageSquare } from "lucide-react"

interface TokenTrackerProps {
  totalTokens: number
  totalCost: number
  currentSession: string
}

export default function TokenTracker({ totalTokens, totalCost, currentSession }: TokenTrackerProps) {
  return (
    <div className="border-b border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Tokens: {totalTokens.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Cost: ${totalCost.toFixed(4)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Session: {currentSession.slice(0, 8)}...</span>
          </div>
        </div>

        <div className="text-xs text-gray-500">Current session usage</div>
      </div>
    </div>
  )
}
