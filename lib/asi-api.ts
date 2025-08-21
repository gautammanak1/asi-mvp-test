import type { Message } from "@/contexts/chat-context"
import { aktuSyllabusDetector, enhanceMessageWithSyllabus } from "@/lib/aktu-syllabus"

const ASI_API_URL = "https://api.asi1.ai/v1/chat/completions"
const API_KEY = process.env.NEXT_PUBLIC_ASI_ONE_API_KEY

export interface ChatCompletionRequest {
  model: string
  messages: Array<{
    role: "user" | "assistant" | "system"
    content: string
  }>
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatCompletionStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason: string | null
  }>
}

// Enhanced function with syllabus detection
export async function sendMessageToASI(messages: Message[], onChunk?: (content: string) => void): Promise<string> {
  if (!API_KEY) {
    throw new Error("ASIMOV API key not configured. Please set NEXT_PUBLIC_ASI_ONE_API_KEY environment variable.")
  }

  // Get the latest user message for syllabus detection
  const latestUserMessage = messages.filter((m) => m.role === "user").pop()

  let apiMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  if (latestUserMessage) {
    const detection = aktuSyllabusDetector.detectSyllabus(latestUserMessage.content)

    if (detection.detectedSubjects.length > 0) {
      // Enhance the latest user message with syllabus context
      const enhancedContent = enhanceMessageWithSyllabus(latestUserMessage.content, detection)

      // Replace the last user message with enhanced version
      apiMessages = apiMessages.map((msg, index) => {
        if (index === apiMessages.length - 1 && msg.role === "user") {
          return { ...msg, content: enhancedContent }
        }
        return msg
      })

      // Add system message for AKTU context if not already present
      const hasSystemMessage = apiMessages.some((msg) => msg.role === "system")
      if (!hasSystemMessage) {
        apiMessages.unshift({
          role: "system",
          content: `You are ASIMOV, an advanced AI assistant powered by fetch.ai, specialized in helping AKTU (Dr. A.P.J. Abdul Kalam Technical University) students and providing comprehensive educational support.

CRITICAL FORMATTING REQUIREMENTS:
- NEVER use emojis in your responses - use plain text only
- For code-related questions: Always wrap code in proper markdown code blocks with language specification (e.g., \`\`\`python, \`\`\`javascript, \`\`\`cpp)
- Use clear step-by-step explanations with numbered lists for complex problems
- Structure responses with proper markdown headings (# ## ###)
- Use bullet points (-) for key concepts and important notes
- Format mathematical equations using standard notation
- Include practical examples and real-world applications
- Use tables for comparisons and data presentation
- Add blockquotes (>) for important definitions or theorems

RESPONSE STRUCTURE:
1. Brief introduction to the topic
2. Step-by-step explanation with clear headings
3. Code examples in proper code blocks (when applicable)
4. Key points summary
5. Additional resources or practice suggestions

EDUCATIONAL FOCUS:
- Provide detailed, exam-oriented guidance for AKTU curriculum
- Include both theoretical concepts and practical implementations
- Offer multiple solution approaches when applicable
- Connect topics to real-world engineering applications
- Suggest additional resources and practice problems
- Focus on conceptual understanding over memorization

TONE: Professional, educational, encouraging, and supportive. Always maintain clarity and avoid unnecessary complexity.

REMEMBER: NO EMOJIS - Use descriptive text instead.`,
        })
      }
    }
  }

  const requestBody: ChatCompletionRequest = {
    model: "asi1-mini",
    messages: apiMessages,
    stream: !!onChunk,
    temperature: 0.7,
    max_tokens: 2048,
  }

  try {
    const response = await fetch(ASI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`ASI:One API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ""}`)
    }

    if (onChunk && response.body) {
      // Handle streaming response
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ""

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim())

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed: ChatCompletionStreamChunk = JSON.parse(data)
                const content = parsed.choices[0]?.delta?.content

                if (content) {
                  fullContent += content
                  onChunk(content)
                }
              } catch {
                console.warn("Skipping malformed chunk:", data)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      return fullContent
    } else {
      // Handle non-streaming response
      const data: ChatCompletionResponse = await response.json()
      return data.choices[0]?.message?.content || ""
    }
  } catch (error) {
    console.error("ASI:One API error:", error)
    throw error
  }
}

export async function generateStudyPlanWithLLM(input: {
  examDate: string
  hoursPerDay: number
  subjects: Array<{ name: string; priority: "high" | "medium" | "low"; estimatedHours: number }>
}): Promise<{
  id: string
  title: string
  examDate: string
  totalHoursPerDay: number
  subjects: Array<{ id: string; name: string; priority: "high" | "medium" | "low"; estimatedHours: number; completed: boolean }>
  schedule: Array<{ id: string; date: string; subject: string; topic: string; duration: number; completed: boolean }>
  createdAt: string
  updatedAt: string
}> {
  if (!API_KEY) {
    throw new Error("ASIMOV API key not configured. Please set NEXT_PUBLIC_ASI_ONE_API_KEY environment variable.")
  }

  const system = `You generate study plans. Return ONLY minified JSON matching this TypeScript type (no markdown):\n{
  id: string; title: string; examDate: string; totalHoursPerDay: number;\n  subjects: { id: string; name: string; priority: \"high\"|\"medium\"|\"low\"; estimatedHours: number; completed: boolean; }[];\n  schedule: { id: string; date: string; subject: string; topic: string; duration: number; completed: boolean; }[];\n  createdAt: string; updatedAt: string;\n}\nRules: examDate and all schedule.date must be ISO 8601 with timezone (e.g., 2025-08-21T00:00:00Z). Allocate sessions up to 3h each, distribute by priority, ensure total per-day about hoursPerDay. No emojis.`

  const user = `Create a study plan. Input: ${JSON.stringify(input)}`

  const body: ChatCompletionRequest = {
    model: "asi1-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    stream: false,
    temperature: 0.3,
    max_tokens: 2500,
  }

  const resp = await fetch(ASI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw new Error(`ASI study plan request failed: ${resp.status} ${resp.statusText} ${err}`)
  }

  const data: ChatCompletionResponse = await resp.json()
  const content = data.choices[0]?.message?.content?.trim() || ""

  // Attempt to extract JSON
  const jsonText = content.startsWith("{") ? content : content.replace(/^```json|```/g, "").trim()
  try {
    const parsed = JSON.parse(jsonText)
    return parsed
  } catch (e) {
    throw new Error("Failed to parse study plan JSON from model response")
  }
}
