"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { agentAPI, messageAPI } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Play } from "lucide-react"
import multiavatar from "@multiavatar/multiavatar"
import { marked } from "marked"

interface Agent {
  _id: string
  name: string
  instructions: string
  icon_name?: string
  tools?: string[]
  tool_data?: { _id: string; name: string }[]
}

export default function AgentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testPrompt, setTestPrompt] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState("")

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true)
        const response = await agentAPI.getById(params.id)
        setAgent(response.data)
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load agent details")
      } finally {
        setLoading(false)
      }
    }
    fetchAgent()
  }, [params.id])

  const getAvatarUrl = (name: string) => {
    return `data:image/svg+xml;base64,${btoa(multiavatar(name))}`
  }

  const handleTest = async () => {
    if (!testPrompt.trim()) return

    setIsTesting(true)
    try {
      const response = await messageAPI.send({
        content: testPrompt,
        agent_id: params.id,
      })
      setTestResult(await marked(response.data.message))
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error testing agent")
      setTestResult("")
    } finally {
      setIsTesting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this agent?")) return

    try {
      await agentAPI.delete(params.id)
      router.push("/agents")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to delete agent")
    }
  }

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

  if (error || !agent) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64 p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Agent not found"}</p>
            <Button onClick={() => router.push("/agents")}>Back to Agents</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              {agent.icon_name ? (
                <img
                  src={getAvatarUrl(agent.icon_name) || "/placeholder.svg"}
                  alt={agent.name}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <span className="text-3xl">{agent.name.charAt(0) || "🤖"}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800">{agent.name}</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => router.push(`/agents/${params.id}/edit`)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Instructions</h2>
            <p className="text-gray-600 text-lg whitespace-pre-wrap">{agent.instructions}</p>
          </div>

          {agent.tool_data && agent.tool_data.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Available Tools</h2>
              <div className="flex flex-wrap gap-2">
                {agent.tool_data.map((tool) => (
                  <span key={tool._id} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Agent</h2>
            <div className="space-y-4">
              <Textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={4}
                placeholder="Enter a test prompt to see how the agent responds..."
              />
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setTestPrompt("")}>
                  Clear
                </Button>
                <Button onClick={handleTest} disabled={isTesting || !testPrompt.trim()}>
                  <Play className="w-4 h-4 mr-2" />
                  {isTesting ? "Testing..." : "Test Agent"}
                </Button>
              </div>
            </div>

            {testResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Test Result</h3>
                <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: testResult }} />
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  )
}
