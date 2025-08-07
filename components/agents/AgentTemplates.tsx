"use client"

import { useState, useEffect } from "react"
import { agentAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AgentTemplate {
  _id: string
  name: string
  instructions: string
  tools: { name: string; _id: string }[] | string[]
}

interface AgentTemplatesProps {
  onSelect: (template: { name: string; instructions: string; tools: string[] }) => void
}

export default function AgentTemplates({ onSelect }: AgentTemplatesProps) {
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await agentAPI.getAll()
        
        // Ensure we have valid data
        if (response.data && Array.isArray(response.data)) {
          setTemplates(response.data)
        } else {
          setTemplates([])
        }
      } catch (error: any) {
        console.error("Error fetching templates:", error)
        setError("Failed to load agent templates")
        setTemplates([])
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const displayedTemplates = showAll ? templates : templates.slice(0, 3)

  const selectTemplate = (template: AgentTemplate) => {
    // Handle both object and string tool formats
    let toolIds: string[] = []
    
    if (template.tools && Array.isArray(template.tools)) {
      toolIds = template.tools.map((tool) => {
        if (typeof tool === 'string') {
          return tool
        } else if (tool && typeof tool === 'object' && tool._id) {
          return tool._id
        }
        return ''
      }).filter(Boolean)
    }

    onSelect({
      name: template.name || '',
      instructions: template.instructions || '',
      tools: toolIds,
    })
  }

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Agent Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Agent Templates</h2>
        <div className="text-red-500 text-sm bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Agent Templates</h2>
        <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg">
          No agent templates available. Create your first agent to see it here as a template.
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Agent Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTemplates.map((template) => {
          // Safely handle tools array
          const tools = template.tools || []
          const toolsToShow = Array.isArray(tools) ? tools.slice(0, 3) : []
          const remainingToolsCount = Array.isArray(tools) ? Math.max(0, tools.length - 3) : 0

          return (
            <Card
              key={template._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => selectTemplate(template)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{template.name || 'Unnamed Agent'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {template.instructions || 'No instructions provided'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {toolsToShow.map((tool, index) => {
                    const toolName = typeof tool === 'string' ? tool : (tool?.name || 'Unknown Tool')
                    const toolId = typeof tool === 'string' ? tool : (tool?._id || index.toString())
                    
                    return (
                      <Badge key={toolId} variant="secondary" className="text-xs">
                        {toolName}
                      </Badge>
                    )
                  })}
                  {remainingToolsCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{remainingToolsCount} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {templates.length > 3 && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : `View More (${templates.length - 3} more)`}
          </Button>
        </div>
      )}
    </div>
  )
}
