export interface DownloadLink {
  url: string
  text: string
  filename?: string
}

export function extractDownloadLinks(content: string): {
  cleanContent: string
  downloadLinks: DownloadLink[]
} {
  const downloadLinks: DownloadLink[] = []

  // Regex to find https://api.atlasprimebr.com links
  const linkRegex = /(https:\/\/api\.atlasprimebr\.com[^\s]+)/g

  let cleanContent = content
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    const url = match[1]

    // Extract filename from URL if possible
    const urlParts = url.split("/")
    const filename = urlParts[urlParts.length - 1] || "download"

    downloadLinks.push({
      url,
      text: `Download ${filename}`,
      filename,
    })

    // Remove the link from content and replace with a placeholder
    cleanContent = cleanContent.replace(url, `[Download Available]`)
  }

  return {
    cleanContent,
    downloadLinks,
  }
}

export function handleDownload(url: string, filename?: string) {
  try {
    const link = document.createElement("a")
    link.href = url
    link.download = filename || "download"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Download failed:", error)
    // Fallback: open in new tab
    window.open(url, "_blank")
  }
}
