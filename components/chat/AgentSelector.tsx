"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Bot } from "lucide-react"

interface Agent {
  _id: string
  name: string
  icon_name?: string
  instructions?: string
}

interface AgentSelectorProps {
  agents: Agent[]
  onSelectAgent: (agentId: string) => void
  onClose: () => void
}

export default function AgentSelector({ agents, onSelectAgent, onClose }: AgentSelectorProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")

  const handleSelect = () => {
    if (selectedAgentId) {
      onSelectAgent(selectedAgentId)
    }
  }

  const getAgentInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAgentColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ]
    return colors[index % colors.length]
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Select an Agent to Chat With
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Available</h3>
              <p className="text-gray-600">Create an agent first to start agent conversations.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {agents.map((agent, index) => (
                <div
                  key={agent._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedAgentId === agent._id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedAgentId(agent._id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 ${getAgentColor(index)} rounded-full flex items-center justify-center text-white font-semibold`}
                    >
                      {getAgentInitials(agent.name)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          Agent
                        </Badge>
                      </div>
                      {agent.instructions && <p className="text-sm text-gray-600 line-clamp-2">{agent.instructions}</p>}
                    </div>
                    {selectedAgentId === agent._id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSelect} disabled={!selectedAgentId || agents.length === 0}>
              Start Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
