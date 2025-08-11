"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { agentAPI, toolAPI } from "@/lib/api"
import { useAuth } from "@/context/authContext"
import AgentTemplates from "@/components/agents/AgentTemplates"
import IconSelect from "@/components/agents/IconSelect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Sidebar from "@/components/layout/Sidebar"
import { useToast } from "@/hooks/use-toast"
import { Menu } from "lucide-react"

interface Tool {
  _id: string
  name: string
  description?: string
  display_name?: string
}

export default function CreateAgentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingTools, setIsLoadingTools] = useState(true)
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [error, setError] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    instructions: "",
    tools: [] as string[],
    icon_name: "",
  })

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only administrators can create agents.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }
  }, [user, authLoading, router, toast])

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoadingTools(true)
        const response = await toolAPI.getAll()
        console.log("Available tools:", response.data)
        const tools = Array.isArray(response.data) ? response.data : []
        setAvailableTools(tools)
      } catch (error) {
        console.error("Error fetching tools:", error)
        setError("Failed to load available tools")
        setAvailableTools([])
      } finally {
        setIsLoadingTools(false)
      }
    }
    fetchTools()
  }, [])

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

      console.log("Creating agent with payload:", payload)

      const response = await agentAPI.create(payload)

      console.log("Agent created successfully:", response.data)

      toast({
        title: "Success",
        description: "Agent created successfully!",
      })

      router.push("/agents")
    } catch (error: any) {
      console.error("Error creating agent:", error)
      const errorMessage =
        error.response?.data?.detail || error.response?.data?.message || error.message || "Failed to create agent"
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

  const handleTemplateSelect = (template: { name: string; instructions: string; tools: string[] }) => {
    setFormData({
      ...formData,
      name: template.name,
      instructions: template.instructions,
      tools: template.tools,
    })
  }

  const handleToolToggle = (toolId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        tools: [...formData.tools, toolId],
      })
    } else {
      setFormData({
        ...formData,
        tools: formData.tools.filter((id) => id !== toolId),
      })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Button variant="outline" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "lg:ml-16" : "ml-0 lg:ml-64"}`}
      >
        <div className="p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 max-lg:ml-12">Create New Agent</h1>

            <AgentTemplates onSelect={handleTemplateSelect} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Agent Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter agent name"
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
                    placeholder="Describe what this agent should do and how it should behave..."
                    rows={isMobile ? 4 : 6}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Tools</Label>
                  <div
                    className={`mt-2 space-y-3 border rounded-md p-4 ${isMobile ? "max-h-48" : "max-h-60"} overflow-y-auto`}
                  >
                    {isLoadingTools ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading tools...</span>
                      </div>
                    ) : availableTools.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No tools available</p>
                    ) : (
                      availableTools.map((tool) => (
                        <div key={tool._id} className="flex items-start space-x-3">
                          <Checkbox
                            id={`tool-${tool._id}`}
                            checked={formData.tools.includes(tool._id)}
                            onCheckedChange={(checked) => handleToolToggle(tool._id, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label htmlFor={`tool-${tool._id}`} className="text-sm font-medium cursor-pointer">
                              {tool.display_name || tool.name}
                            </Label>
                            {tool.description && <p className="text-xs text-gray-500 mt-1">{tool.description}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Selected tools: {formData.tools.length}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/agents")}
                  className="w-full sm:flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.instructions.trim()}
                  className="w-full sm:flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Agent"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
