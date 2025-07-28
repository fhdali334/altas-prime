"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { agentAPI, toolAPI } from "@/lib/api"
import Sidebar from "@/components/layout/Sidebar"
import IconSelect from "@/components/agents/IconSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save, ArrowLeft } from "lucide-react"

interface Tool {
  _id: string
  name: string
}

interface Agent {
  _id: string
  name: string
  instructions: string
  icon_name?: string
  tool_data?: { _id: string; name: string }[]
}

export default function EditAgentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    tools: [] as string[],
    icon_name: null as string | null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [toolsResponse, agentResponse] = await Promise.all([toolAPI.getAll(), agentAPI.getById(params.id)])

        setAvailableTools(toolsResponse.data)

        const agent = agentResponse.data
        setFormData({
          name: agent.name,
          instructions: agent.instructions,
          tools: agent.tool_data?.map((tool: any) => tool._id) || [],
          icon_name: agent.icon_name || null,
        })
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.response?.data?.detail || "Failed to load agent details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.instructions) return

    try {
      setIsSubmitting(true)
      setError("")

      await agentAPI.update(params.id, {
        name: formData.name,
        instructions: formData.instructions,
        tools: formData.tools,
        icon_name: formData.icon_name,
      })

      router.push(`/agents/${params.id}`)
    } catch (err: any) {
      console.error("Error updating agent:", err)
      setError(err.response?.data?.detail || "Failed to update agent")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
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
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/agents/${params.id}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Agent</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Agent Avatar</Label>
            <IconSelect
              value={formData.icon_name}
              onChange={(value) => setFormData({ ...formData, icon_name: value })}
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="tools">Tools</Label>
            <select
              id="tools"
              multiple
              value={formData.tools}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, (option) => option.value)
                setFormData({ ...formData, tools: values })
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
              size={4}
            >
              {availableTools.map((tool) => (
                <option key={tool._id} value={tool._id}>
                  {tool.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) or Command (Mac) to select multiple tools</p>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/agents/${params.id}`)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
