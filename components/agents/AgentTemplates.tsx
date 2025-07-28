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
  tools: { name: string; _id: string }[]
}

interface AgentTemplatesProps {
  onSelect: (template: { name: string; instructions: string; tools: string[] }) => void
}

export default function AgentTemplates({ onSelect }: AgentTemplatesProps) {
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await agentAPI.getAll()
        setTemplates(response.data)
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const displayedTemplates = showAll ? templates : templates.slice(0, 3)

  const selectTemplate = (template: AgentTemplate) => {
    onSelect({
      name: template.name,
      instructions: template.instructions,
      tools: template.tools.map((tool) => tool._id),
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

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Agent Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedTemplates.map((template) => (
          <Card
            key={template._id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectTemplate(template)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{template.instructions}</p>
              <div className="flex flex-wrap gap-1">
                {template.tools.slice(0, 3).map((tool) => (
                  <Badge key={tool._id} variant="secondary" className="text-xs">
                    {tool.name}
                  </Badge>
                ))}
                {template.tools.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tools.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
