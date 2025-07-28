"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { agentAPI } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import multiavatar from "@multiavatar/multiavatar"

interface Agent {
  _id: string
  name: string
  instructions: string
  icon_name?: string
  status?: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        const response = await agentAPI.getAll()
        setAgents(response.data)
      } catch (err) {
        setError("Failed to load agents")
        console.error("Error fetching agents:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  const getAvatarUrl = (name: string) => {
    return `data:image/svg+xml;base64,${btoa(multiavatar(name))}`
  }

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.instructions.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <Link href="/create-agent">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Agent
            </Button>
          </Link>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Link
              key={agent._id}
              href={`/agents/${agent._id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {agent.icon_name ? (
                      <img
                        src={getAvatarUrl(agent.icon_name) || "/placeholder.svg"}
                        alt={agent.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="text-blue-600 font-semibold text-lg">{agent.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">active</span>
              </div>
              <div className="mt-4 h-20 overflow-hidden">
                <p className="text-gray-600 text-sm line-clamp-3">{agent.instructions}</p>
              </div>
            </Link>
          ))}
        </div>

        {filteredAgents.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No agents found</p>
          </div>
        )}
      </div>
    </div>
  )
}
