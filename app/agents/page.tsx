"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { agentAPI } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Menu } from 'lucide-react'
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-4 left-4 z-30">
          <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu className="w-4 h-4" />
          </Button>
        </div>

        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "ml-0 lg:ml-64"} flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "ml-0 lg:ml-64"} overflow-y-auto`}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Agents</h1>
            <Link href="/create-agent">
              <Button className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Add Agent
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Agents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredAgents.map((agent) => (
              <Link
                key={agent._id}
                href={`/agents/${agent._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 block"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      {agent.icon_name ? (
                        <img
                          src={getAvatarUrl(agent.icon_name) || "/placeholder.svg"}
                          alt={agent.name}
                          className="w-full h-full rounded-full"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-sm sm:text-lg">
                          {agent.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {agent.name}
                      </h3>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                    active
                  </span>
                </div>
                
                {/* Instructions */}
                <div className="h-16 sm:h-20 overflow-hidden">
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {agent.instructions}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Empty State */}
          {filteredAgents.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No agents found" : "No agents yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Create your first agent to get started"
                  }
                </p>
                {!searchQuery && (
                  <Link href="/create-agent">
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Agent
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
