export interface SerperResult {
  title: string
  link: string
  snippet: string
  date?: string
  imageUrl?: string
}

export interface SerperResponse {
  organic: SerperResult[]
  videos?: Array<{
    title: string
    link: string
    snippet: string
    imageUrl: string
    duration: string
  }>
  images?: Array<{
    title: string
    imageUrl: string
    link: string
  }>
}

export async function searchWeb(
  query: string,
  type: "search" | "videos" | "images" = "search",
): Promise<SerperResponse> {
  const myHeaders = new Headers()
  myHeaders.append("X-API-KEY", process.env.NEXT_PUBLIC_SERPER_API_KEY || '')
  myHeaders.append("Content-Type", "application/json")

  const raw = JSON.stringify({
    q: query,
    num: type === "videos" ? 6 : 8,
  })

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as RequestRedirect,
  }

  try {
    const endpoint = type === "videos" ? "videos" : type === "images" ? "images" : "search"
    const response = await fetch(`https://google.serper.dev/${endpoint}`, requestOptions)
    const result = await response.json()
    return result
  } catch (error) {
    console.error("Serper API error:", error)
    throw error
  }
}

export function shouldSearchWeb(message: string): {
  shouldSearch: boolean
  searchType: "search" | "videos" | "images"
  query: string
} {
  const lowerMessage = message.toLowerCase()

  // Check for video requests
  if (
    lowerMessage.includes("video") ||
    lowerMessage.includes("tutorial") ||
    lowerMessage.includes("watch") ||
    lowerMessage.includes("youtube")
  ) {
    return {
      shouldSearch: true,
      searchType: "videos",
      query: message.replace(/show me|find|search for|give me|i want|can you/gi, "").trim(),
    }
  }

  // Check for image requests
  if (
    lowerMessage.includes("image") ||
    lowerMessage.includes("picture") ||
    lowerMessage.includes("photo") ||
    lowerMessage.includes("diagram")
  ) {
    return {
      shouldSearch: true,
      searchType: "images",
      query: message.replace(/show me|find|search for|give me|i want|can you/gi, "").trim(),
    }
  }

  // Check for general web search requests
  if (
    lowerMessage.includes("search") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("latest") ||
    lowerMessage.includes("current") ||
    lowerMessage.includes("news") ||
    lowerMessage.includes("link")
  ) {
    return {
      shouldSearch: true,
      searchType: "search",
      query: message.replace(/search for|find|give me|show me|i want|can you/gi, "").trim(),
    }
  }

  return { shouldSearch: false, searchType: "search", query: "" }
}
