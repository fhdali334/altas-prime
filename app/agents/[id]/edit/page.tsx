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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft } from 'lucide-react'

interface Tool {
  _id: string
  name: string
  description?: string
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
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    tools: [] as string[],
    icon_name: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [toolsResponse, agentResponse] = await Promise.all([
          toolAPI.getAll(), 
          agentAPI.getById(params.id)
        ])

        setAvailableTools(toolsResponse.data || [])

        const agent = agentResponse.data
        setFormData({
          name: agent.name || "",
          instructions: agent.instructions || "",
          tools: agent.tool_data?.map((tool: any) => tool._id) || [],
          icon_name: agent.icon_name || "",
        })
      } catch (err: any) {
        console.error("Error fetching data:", err)
        const errorMessage = err.response?.data?.detail || 
                            err.response?.data?.message || 
                            "Failed to load agent details"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.instructions.trim()) {
      setError("Name and instructions are required")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      const payload = {
        name: formData.name.trim(),
        instructions: formData.instructions.trim(),
        tools: formData.tools,
        icon_name: formData.icon_name || undefined,
      }

      console.log("Updating agent with payload:", payload)

      await agentAPI.update(params.id, payload)

      toast({
        title: "Success",
        description: "Agent updated successfully!",
      })

      router.push(`/agents/${params.id}`)
    } catch (err: any) {
      console.error("Error updating agent:", err)
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          "Failed to update agent"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToolToggle = (toolId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        tools: [...formData.tools, toolId]
      })
    } else {
      setFormData({
        ...formData,
        tools: formData.tools.filter(id => id !== toolId)
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* <Sidebar /> */}
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar /> */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/agents/${params.id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Edit Agent</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Agent Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Agent Avatar</Label>
              <div className="mt-1">
                <IconSelect
                  value={formData.icon_name}
                  onChange={(value) => setFormData({ ...formData, icon_name: value || "" })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="instructions" className="text-sm font-medium">
                Instructions *
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={6}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Tools</Label>
              <div className="mt-2 space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
                {availableTools.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No tools available</p>
                ) : (
                  availableTools.map((tool) => (
                    <div key={tool._id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`tool-${tool._id}`}
                        checked={formData.tools.includes(tool._id)}
                        onCheckedChange={(checked) => handleToolToggle(tool._id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`tool-${tool._id}`} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {tool.name}
                        </Label>
                        {tool.description && (
                          <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected tools: {formData.tools.length}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/agents/${params.id}`)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.name.trim() || !formData.instructions.trim()} 
                className="flex-1 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
