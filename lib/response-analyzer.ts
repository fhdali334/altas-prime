interface StructuredAnalysis {
  strengths: string[]
  weaknesses: string[]
  recommended_actions: string[]
}

export function analyzeContent(content: string): StructuredAnalysis | null {
  // Check if content is already in structured format
  try {
    const parsed = JSON.parse(content)
    if (parsed.strengths && parsed.weaknesses && parsed.recommended_actions) {
      return parsed
    }
  } catch {
    // Not JSON, continue with analysis
  }

  // Analyze content and extract key points
  const lines = content.split("\n").filter((line) => line.trim())
  const strengths: string[] = []
  const weaknesses: string[] = []
  const recommended_actions: string[] = []

  // Extract strengths from content
  const strengthKeywords = [
    "advantage",
    "benefit",
    "strength",
    "positive",
    "opportunity",
    "growth",
    "innovation",
    "major companies",
    "key components",
    "connectivity",
    "global influence",
  ]
  const weaknessKeywords = [
    "challenge",
    "problem",
    "issue",
    "risk",
    "threat",
    "limitation",
    "concern",
    "inequality",
    "security risks",
    "regulation",
  ]
  const actionKeywords = [
    "should",
    "recommend",
    "improve",
    "enhance",
    "develop",
    "focus",
    "invest",
    "address",
    "solution",
  ]

  // Process content sections
  let currentSection = ""
  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    if (lowerLine.includes("overview") || lowerLine.includes("key components") || lowerLine.includes("trends")) {
      currentSection = "overview"
    } else if (lowerLine.includes("challenge") || lowerLine.includes("problem") || lowerLine.includes("risk")) {
      currentSection = "challenges"
    } else if (lowerLine.includes("opportunity") || lowerLine.includes("emerging")) {
      currentSection = "opportunities"
    }

    // Extract bullet points and key information
    if (line.includes("**") || line.includes("- ")) {
      const cleanLine = line.replace(/\*\*/g, "").replace(/^- /, "").trim()

      if (strengthKeywords.some((keyword) => lowerLine.includes(keyword)) || currentSection === "opportunities") {
        if (cleanLine.length > 10) strengths.push(cleanLine)
      } else if (weaknessKeywords.some((keyword) => lowerLine.includes(keyword)) || currentSection === "challenges") {
        if (cleanLine.length > 10) weaknesses.push(cleanLine)
      }
    }
  }

  // Generate recommended actions based on content
  if (content.toLowerCase().includes("tech industry")) {
    recommended_actions.push("Stay updated with emerging technologies like AI and blockchain")
    recommended_actions.push("Focus on digital transformation initiatives")
    recommended_actions.push("Invest in cybersecurity and data privacy measures")
  }

  if (content.toLowerCase().includes("internet")) {
    recommended_actions.push("Ensure reliable internet infrastructure for business operations")
    recommended_actions.push("Leverage cloud services for scalability")
    recommended_actions.push("Implement proper security protocols for online activities")
  }

  // Fallback: extract key points from content
  if (strengths.length === 0) {
    const keyPoints = content.match(/\*\*[^*]+\*\*[^*\n]+/g) || []
    keyPoints.slice(0, 3).forEach((point) => {
      const clean = point.replace(/\*\*/g, "").trim()
      if (clean.length > 10) strengths.push(clean)
    })
  }

  if (weaknesses.length === 0) {
    const challenges = content.match(/challenge[s]?[:\-\s]+([^.\n]+)/gi) || []
    challenges.slice(0, 3).forEach((challenge) => {
      const clean = challenge.replace(/challenge[s]?[:\-\s]+/i, "").trim()
      if (clean.length > 10) weaknesses.push(clean)
    })
  }

  return strengths.length > 0 || weaknesses.length > 0 || recommended_actions.length > 0
    ? { strengths, weaknesses, recommended_actions }
    : null
}
