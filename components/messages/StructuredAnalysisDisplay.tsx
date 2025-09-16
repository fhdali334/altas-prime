"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"

interface StructuredAnalysis {
  strengths: string[]
  weaknesses: string[]
  recommended_actions: string[]
}

interface StructuredAnalysisDisplayProps {
  analysis: StructuredAnalysis
}

export default function StructuredAnalysisDisplay({ analysis }: StructuredAnalysisDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Strengths Section */}
      {analysis.strengths.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-2 py-1 mt-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-green-900 leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Weaknesses Section */}
      {analysis.weaknesses.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
              <AlertTriangle className="w-5 h-5" />
              Challenges & Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-2 py-1 mt-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-orange-900 leading-relaxed">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions Section */}
      {analysis.recommended_actions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800 text-lg">
              <Lightbulb className="w-5 h-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {analysis.recommended_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-2 py-1 mt-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-blue-900 leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
