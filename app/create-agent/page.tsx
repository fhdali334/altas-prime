"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { agentAPI, toolAPI } from "@/lib/api"
import AgentTemplates from "@/components/agents/AgentTemplates"
import IconSelect from "@/components/agents/IconSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Sidebar from "@/components/layout/Sidebar"

interface Tool {
  _id: string
  name: string
}

export default function CreateAgentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    tools: [] as string[],
    icon_name: null as string | null,
  })

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await toolAPI.getAll()
        setAvailableTools(response.data)
      } catch (error) {
        console.error("Error fetching tools:", error)
      }
    }
    fetchTools()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.instructions) return

    try {
      setIsSubmitting(true)
      await agentAPI.create({
        name: formData.name,
        instructions: formData.instructions,
        tools: formData.tools,
        icon_name: formData.icon_name,
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating agent:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTemplateSelect = (template: { name: string; instructions: string; tools: string[] }) => {
    setFormData({
      ...formData,
      name: template.name,
      instructions: template.instructions,
      tools: template.tools,
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Agent</h1>

        <AgentTemplates onSelect={handleTemplateSelect} />

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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Agent"}
          </Button>
        </form>
      </div>
    </div>
  )
}
