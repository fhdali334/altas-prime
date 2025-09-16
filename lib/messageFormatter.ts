export function formatMessageContent(content: string): string {
  let formatted = content

  // Remove markdown headings (###, ####, etc.)
  formatted = formatted.replace(/^#{1,6}\s+/gm, "")

  // Remove numbered headings like "1. **Overview:**", "2. **Applications:**", etc.
  formatted = formatted.replace(/^\d+\.\s*\*\*[^*]+\*\*:?\s*/gm, "")

  // Remove standalone bold headings like "**Overview:**", "**Applications:**", etc.
  formatted = formatted.replace(/^\*\*[^*]+\*\*:?\s*/gm, "")

  // Remove all bold formatting (**text**)
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "$1")

  // Remove all italic formatting (*text*)
  formatted = formatted.replace(/\*([^*]+)\*/g, "$1")

  // Remove code blocks (```...```)
  formatted = formatted.replace(/```[\s\S]*?```/g, "")

  // Remove inline code (`code`)
  formatted = formatted.replace(/`([^`]+)`/g, "$1")

  // Remove bullet points and convert to flowing text
  formatted = formatted.replace(/^[-•*]\s+/gm, "")

  // Clean up multiple consecutive newlines
  formatted = formatted.replace(/\n{3,}/g, "\n\n")

  // Remove leading/trailing whitespace
  formatted = formatted.trim()

  // Convert remaining content into flowing paragraphs
  const paragraphs = formatted.split("\n\n").filter((p) => p.trim())

  // Join paragraphs with proper spacing for natural flow
  return paragraphs.join("\n\n")
}
